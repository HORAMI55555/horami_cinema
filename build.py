"""Build HORAMI CINEMA using the shared site generator."""
from pathlib import Path
import runpy
import sys

scripts = Path(__file__).resolve().parent / "scripts"
sys.path.insert(0, str(scripts))
runpy.run_path(str(scripts / "build.py"), run_name="__main__")
