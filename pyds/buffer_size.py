__all__ = [
    "buffer_size",
    "scoped_buffer_size",
]

from contextlib import contextmanager

_buffer_size = 1024


def buffer_size(size: int = 0) -> int:
    global _buffer_size
    old_buffer_size = _buffer_size
    if size > 0:
        _buffer_size = size
    return old_buffer_size


@contextmanager
def scoped_buffer_size(size: int = 0):
    old_buffer_size = buffer_size(size)
    try:
        yield
    finally:
        buffer_size(old_buffer_size)
