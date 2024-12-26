###
# Flux Build System
# License: MIT LICENSE
# Project: https://github.com/Thoq-jar/Flux
# Copyright (c) Thoq 2024 - Present
###

# [Flux/build] Start of src/flux_cfg.py
import json


def load_flux_config(file_path):
    with open(file_path, 'r') as file:
        return json.load(file)


# End of {fname}

# [Flux/build] Start of src/flux_utils.py
banner = """
\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2557     \u2588\u2588\u2557   \u2588\u2588\u2557\u2588\u2588\u2557  \u2588\u2588\u2557
\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255d\u2588\u2588\u2551     \u2588\u2588\u2551   \u2588\u2588\u2551\u255a\u2588\u2588\u2557\u2588\u2588\u2554\u255d
\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2551     \u2588\u2588\u2551   \u2588\u2588\u2551 \u255a\u2588\u2588\u2588\u2554\u255d 
\u2588\u2588\u2554\u2550\u2550\u255d  \u2588\u2588\u2551     \u2588\u2588\u2551   \u2588\u2588\u2551 \u2588\u2588\u2554\u2588\u2588\u2557 
\u2588\u2588\u2551     \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u255a\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255d\u2588\u2588\u2554\u255d \u2588\u2588\u2557
\u255a\u2550\u255d     \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u255d \u255a\u2550\u2550\u2550\u2550\u2550\u255d \u255a\u2550\u255d  \u255a\u2550\u255d
"""


def log(message):
    print("[Flux/build] " + message)


def info(config):
    print(banner)
    log("Available commands in flux.json:")
    if 'flux' in config:
        for command in config['flux']:
            log(f"  --{command}")
    else:
        log("  No commands found in flux configuration.")


# End of {fname}

# [Flux/build] Start of src/__init__.py
# End of {fname}

# [Flux/build] Start of src/main.py

# End of {fname}

# [Flux/build] Start of src/flux.py
import sys


def start():
    if len(sys.argv) < 2:
        log("[Flux] Usage: flux --<function_name>")
        sys.exit(1)

    args = sys.argv[1][2:]
    config = load_flux_config('flux.json')

    if 'flux' in config and args in config['flux']:
        command = config['flux'][args]
        log(f"Executing: {command}")
        execute_command(command)
    elif args.lower() in ['version', 'help']:
        info(config)
    else:
        log(
            f"Function / Command '{args}' not found in flux configuration and is not a valid argument! "
            f"Type 'help' for a list of commands or arguments."
        )


# End of {fname}

# [Flux/build] Start of src/flux_exec.py
import subprocess


def execute_command(command):
    try:
        subprocess.run(command, shell=True, check=True)
    except subprocess.CalledProcessError as ex:
        log(f"[FLUX]: Error executing command: {ex}")


# End of {fname}

# [Flux/build] Start of __main__ blocks
if __name__ == "__main__":
    start()
# End of __main__ blocks