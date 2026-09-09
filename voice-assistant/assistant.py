#!/usr/bin/env python3
"""
AXIA - assistente de voz em Python.

Pipeline completo: microfone -> reconhecimento de fala (SpeechRecognition) ->
POST /api/assistant/chat no backend AXIA -> resposta falada (ElevenLabs real,
se ELEVENLABS_API_KEY estiver configurada, ou TTS offline via pyttsx3).

Em ambientes sem microfone/alto-falante (containers, CI, este próprio
ambiente de testes), use o modo texto, que pula toda a parte de áudio e
testa a integração de ponta a ponta com o backend:

    python3 assistant.py --text "quais são minhas tarefas?"

Uso contínuo com voz (precisa de hardware de áudio de verdade):

    python3 assistant.py --listen
"""

import argparse
import json
import os
import sys
from pathlib import Path

import requests

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass

DEFAULT_SERVER = os.environ.get("AXIA_SERVER_URL", "http://localhost:8080")
SESSION_FILE = Path(os.environ.get("AXIA_SESSION_FILE", str(Path.home() / ".axia_cli_session.json")))


def log(msg):
    print(f"[axia-voice] {msg}", file=sys.stderr)


# ---------------------------------------------------------------------------
# Autenticação — reaproveita/gera um token JWT do backend, cacheado em disco.
# ---------------------------------------------------------------------------

def _save_session(server_url, token):
    SESSION_FILE.write_text(json.dumps({"server_url": server_url, "token": token}))


def _load_cached_token(server_url):
    if not SESSION_FILE.exists():
        return None
    try:
        data = json.loads(SESSION_FILE.read_text())
    except (json.JSONDecodeError, OSError):
        return None
    if data.get("server_url") != server_url:
        return None
    return data.get("token")


def get_token(server_url, email, password, name):
    cached = _load_cached_token(server_url)
    if cached:
        # valida o token com um endpoint autenticado leve
        resp = requests.get(f"{server_url}/api/auth/me", headers={"Authorization": f"Bearer {cached}"}, timeout=10)
        if resp.ok:
            return cached
        log("token em cache expirado/inválido, autenticando de novo...")

    # Tenta criar conta; se o e-mail já existir, faz login.
    signup_resp = requests.post(
        f"{server_url}/api/auth/signup",
        json={"name": name, "email": email, "password": password},
        timeout=15,
    )
    if signup_resp.status_code == 201:
        token = signup_resp.json()["token"]
        _save_session(server_url, token)
        return token

    login_resp = requests.post(
        f"{server_url}/api/auth/login", json={"email": email, "password": password}, timeout=15
    )
    login_resp.raise_for_status()
    token = login_resp.json()["token"]
    _save_session(server_url, token)
    return token


# ---------------------------------------------------------------------------
# Chat com o backend AXIA
# ---------------------------------------------------------------------------

def chat(server_url, token, message):
    resp = requests.post(
        f"{server_url}/api/assistant/chat",
        headers={"Authorization": f"Bearer {token}"},
        json={"message": message},
        timeout=60,
    )
    resp.raise_for_status()
    return resp.json()


# ---------------------------------------------------------------------------
# Texto-para-voz: ElevenLabs (real, se configurado) com fallback pyttsx3.
# ---------------------------------------------------------------------------

def speak(text, no_speak=False):
    if no_speak:
        return

    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if api_key:
        try:
            _speak_elevenlabs(text, api_key)
            return
        except Exception as exc:  # noqa: BLE001 - qualquer falha cai pro TTS offline
            log(f"ElevenLabs falhou ({exc}), usando TTS offline (pyttsx3).")

    _speak_offline(text)


def _speak_elevenlabs(text, api_key):
    voice_id = os.environ.get("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")
    resp = requests.post(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
        headers={"xi-api-key": api_key, "Content-Type": "application/json", "Accept": "audio/mpeg"},
        json={"text": text, "model_id": "eleven_multilingual_v2"},
        timeout=30,
    )
    resp.raise_for_status()

    import tempfile

    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
        f.write(resp.content)
        audio_path = f.name

    _play_audio_file(audio_path)


def _play_audio_file(path):
    """Toca um arquivo de áudio usando o tocador disponível no sistema."""
    import platform
    import subprocess

    system = platform.system()
    try:
        if system == "Darwin":
            subprocess.run(["afplay", path], check=True)
        elif system == "Windows":
            os.startfile(path)  # noqa: S606
        else:
            # Linux: tenta ffplay, depois aplay/paplay
            for player in (["ffplay", "-nodisp", "-autoexit", "-loglevel", "quiet"], ["paplay"], ["aplay"]):
                try:
                    subprocess.run(player + [path], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    return
                except (FileNotFoundError, subprocess.CalledProcessError):
                    continue
            raise RuntimeError("Nenhum tocador de áudio encontrado (ffplay/paplay/aplay)")
    except Exception as exc:  # noqa: BLE001
        log(f"Não consegui reproduzir áudio (sem alto-falante neste ambiente?): {exc}")


def _speak_offline(text):
    try:
        import pyttsx3
    except ImportError:
        log("pyttsx3 não instalado — pulando fala (rode `pip install -r requirements.txt`).")
        return
    try:
        engine = pyttsx3.init()
        engine.say(text)
        engine.runAndWait()
    except Exception as exc:  # noqa: BLE001
        log(f"Motor de TTS offline indisponível neste ambiente (sem alto-falante?): {exc}")


# ---------------------------------------------------------------------------
# Reconhecimento de fala (modo --listen, precisa de microfone de verdade)
# ---------------------------------------------------------------------------

def listen_loop(server_url, token, no_speak):
    try:
        import speech_recognition as sr
    except ImportError:
        log("SpeechRecognition não instalado. Rode: pip install -r requirements.txt")
        sys.exit(1)

    recognizer = sr.Recognizer()
    try:
        microphone = sr.Microphone()
    except (OSError, AttributeError) as exc:
        log(f"Nenhum microfone disponível neste ambiente ({exc}).")
        log("Use o modo texto: python3 assistant.py --text \"sua mensagem\"")
        sys.exit(1)

    log("Ouvindo... fale algo (Ctrl+C para sair).")
    with microphone as source:
        recognizer.adjust_for_ambient_noise(source)
        while True:
            try:
                audio = recognizer.listen(source, timeout=10, phrase_time_limit=15)
            except sr.WaitTimeoutError:
                continue

            try:
                message = recognizer.recognize_google(audio, language="pt-BR")
            except sr.UnknownValueError:
                log("Não entendi, pode repetir?")
                continue
            except sr.RequestError as exc:
                log(f"Erro no serviço de reconhecimento de fala: {exc}")
                continue

            print(f"Você: {message}")
            result = chat(server_url, token, message)
            print(f"AXIA: {result['reply']}")
            speak(result["reply"], no_speak)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Assistente de voz/texto AXIA")
    parser.add_argument("--text", help="Manda uma única mensagem de texto (sem usar microfone) e sai")
    parser.add_argument("--listen", action="store_true", help="Modo contínuo por voz (precisa de microfone real)")
    parser.add_argument("--server-url", default=DEFAULT_SERVER, help="URL do backend AXIA")
    parser.add_argument("--email", default=os.environ.get("AXIA_EMAIL", "voice-assistant@axia.dev"))
    parser.add_argument("--password", default=os.environ.get("AXIA_PASSWORD", "senha123"))
    parser.add_argument("--name", default=os.environ.get("AXIA_NAME", "Assistente de Voz"))
    parser.add_argument("--no-speak", action="store_true", help="Não tenta reproduzir áudio (só imprime texto)")
    args = parser.parse_args()

    if not args.text and not args.listen:
        parser.error("use --text \"mensagem\" ou --listen")

    token = get_token(args.server_url, args.email, args.password, args.name)

    if args.text:
        result = chat(args.server_url, token, args.text)
        mode = "DEMO (sem IA real)" if result.get("demoMode") else f"IA real ({result.get('model')})"
        print(f"Modo: {mode}")
        print(f"AXIA: {result['reply']}")
        speak(result["reply"], args.no_speak)
        return

    listen_loop(args.server_url, token, args.no_speak)


if __name__ == "__main__":
    main()
