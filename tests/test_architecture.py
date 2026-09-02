"""Architectural validation suite for monorepo constraints."""

import os
from pathlib import Path


def test_directory_structure():
    """Verify all required top-level monorepo directories exist."""
    base_dir = Path(__file__).parent.parent
    expected_directories = [
        "frontend",
        "backend",
        "ml",
        "data/raw",
        "data/interim",
        "data/processed",
        "data/synthetic",
        "notebooks",
        "models",
        "scripts",
        "docs",
        "tests",
        "docker",
    ]

    for rel_path in expected_directories:
        full_path = base_dir / rel_path
        assert full_path.exists(), f"Missing required directory: {rel_path}"
        assert full_path.is_dir(), f"Path is not a directory: {rel_path}"


def test_backend_structure():
    """Verify backend app architecture layout."""
    base_dir = Path(__file__).parent.parent / "backend" / "app"
    expected_modules = ["main.py", "config.py", "database.py", "models", "schemas", "api", "services", "utils"]

    for module in expected_modules:
        full_path = base_dir / module
        assert full_path.exists(), f"Missing required backend module: {module}"


def test_ml_structure():
    """Verify ML architecture layout."""
    base_dir = Path(__file__).parent.parent / "ml"
    expected_subdirs = [
        "ingestion",
        "preprocessing",
        "features",
        "models/baseline",
        "models/cost",
        "models/delay",
        "models/risk",
        "explainability",
        "evaluation",
        "pipeline",
    ]

    for subdir in expected_subdirs:
        full_path = base_dir / subdir
        assert full_path.exists(), f"Missing required ML subdirectory: {subdir}"
