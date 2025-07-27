import { ds, type dst } from "./emcc_interface.mts";
import { _common_t } from "./common_t.mts";
import { rule_t } from "./rule_t.mts";

export class search_t {
    _search: dst.Search;

    constructor(limit_size: number = 1000, buffer_size: number = 10000) {
        this._search = new ds.Search(limit_size, buffer_size);
    }

    set_limit_size(limit_size: number): void {
        this._search.set_limit_size(limit_size);
    }

    set_buffer_size(buffer_size: number): void {
        this._search.set_buffer_size(buffer_size);
    }

    reset(): void {
        this._search.reset();
    }

    add(text: string): boolean {
        return this._search.add(text);
    }

    execute(callback: (candidate: rule_t) => boolean): number {
        return this._search.execute((candidate: dst.Rule): boolean => {
            // 由于embind的限制，这里的candidate已经在c++端被复制过一次，在此不需要再次复制。
            return callback(new rule_t(candidate));
        });
    }
}
