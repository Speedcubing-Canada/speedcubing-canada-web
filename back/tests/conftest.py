"""Load pure-Python modules without triggering backend/__init__.py (which requires GCP)."""

import importlib.util
import sys
from pathlib import Path
from types import ModuleType

# Stub the backend package so Python never executes backend/__init__.py
_backend = ModuleType("backend")
_backend.__path__ = []
_backend_load_db = ModuleType("backend.load_db")
_backend_load_db.__path__ = []
sys.modules.setdefault("backend", _backend)
sys.modules.setdefault("backend.load_db", _backend_load_db)
_backend.load_db = _backend_load_db

# Load championship_classifier directly from its file, bypassing the package init
_root = Path(__file__).parent.parent
_spec = importlib.util.spec_from_file_location(
    "backend.load_db.championship_classifier",
    _root / "backend" / "load_db" / "championship_classifier.py",
)
_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_mod)
sys.modules["backend.load_db.championship_classifier"] = _mod
_backend_load_db.championship_classifier = _mod
