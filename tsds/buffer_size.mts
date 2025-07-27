let _buffer_size: number = 1024;

export function buffer_size(size: number = 0): number {
    const old_size = _buffer_size;
    if (size !== 0) {
        _buffer_size = size;
    }
    return old_size;
}
