/* Hive Engine Tools v2
* Ported from [PHP] Steem Engine Tools (by @cadawg) to JavaScript by @cadawg 12/06/2020
* © cadawg <cadawg@protonmail.com> https://github.com/Snaddyvitch-Dispenser https://peakd.com/@cadawg 2020
* */


class HiveEngineAPI {
    constructor(API_URL ="") {
        if (API_URL === "") {
            API_URL = "https://api.hive-engine.com/"
        }
        this.api_url = API_URL;
    }

    getRPCUrl() {
        return this.api_url + "rpc/";
    }

    getContractUrl() {
        return this.getRPCUrl() + "contracts";
    }

    async queryContract(contract,table,query={},offset=0) {
        let response = await fetch(
            this.getContractUrl(),
            {
                method: 'POST',
                body: JSON.stringify([{"method": "find", "jsonrpc": "2.0", "params": {"contract":  contract, "table":  table, "query": query, "limit": 1000, "offset": offset, "indexes" : []},  "id" : 1}]),
                headers: {"Content-Type": "application/json", "Cache-Control": "no-cache"}
            }
        );

        let data = await response.json();

        if (data !== undefined && data !== null && data[0].result !== null && data[0].result !== undefined) {
            return data[0].result;
        } else {
            return false;
        }
    }

    async getUserBalances($user = "null") {
        return await this.queryContract("tokens","balances",{account: $user});
    }

    async getMarketSells($user = "", $token = "", offset=0) {
        let $query = {};
        if ($user.length > 0) {
            $query["account"] = $user.toLowerCase();
        }
        if ($token.length > 0) {
            $query["symbol"] = $token.toUpperCase();
        }
        return await this.queryContract("market","sellBook",$query,offset);
    }

    async getMarketBuys($user = "", $token = "", offset=0) {
        let $query = {};
        if ($user.length > 0) {
            $query["account"] = $user.toLowerCase();
        }
        if ($token.length > 0) {
            $query["symbol"] = $token.toUpperCase();
        }
        return await this.queryContract("market","buyBook",$query,offset);
    }

    async getTokens() {
        return this.queryContract("tokens", "tokens", {});
    }

    async getUndelegations($user = "", $token = "", offset = 0) {
        let $query = {};
        if ($user.length > 0) {
            $query["account"] = $user.toLowerCase();
        }
        if ($token.length > 0) {
            $query["symbol"] = $token.toUpperCase();
        }

        return await this.queryContract("tokens", "pendingUndelegations", $query, offset);
    }

    async getDelegations($initialQuery = {}, offset = 0) {
        let $query = {};
        for (let key in $initialQuery) {
            if ($initialQuery.hasOwnProperty(key) && $initialQuery[key].length > 0)
                $query[key] = $initialQuery[key];
        }

        return await this.queryContract("tokens", "delegations", $query, offset);
    }

    async getUserBalanceOne($user="null",$token="") {
        let $query = {"account": $user.toLowerCase(), "symbol": $token.toUpperCase()};
        return await this.queryContract("tokens", "balances", $query);
    }
}

export default HiveEngineAPI;