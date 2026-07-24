"""
Bushel & Bone — Balance Model: STRATEGIES (automated player policies).

Each strategy is a policy the engine queries via hooks. They are intentionally
simple and legible — the point is to compare *archetypes* of play, not to find
the perfect line. Hooks the engine calls:

  on_start(farm)                       once, at run start
  clear_fields(farm) -> int            Spring: how many new fields to clear
  plant(farm, free_fields) -> [crop]   crop per free field (aligned to the list)
  cruelty_sacrifices(farm) -> int      clones to sacrifice for taint this season
  buy_clone(farm) -> bool              want to buy a clone now? (asked up to 2x/season)
  will_buy_food(farm) -> bool          buy food/coal at market when short?
  provision_winter(farm)               Fall: set farm._fuel (chop wood / buy coal)
  disposal(farm) -> str                how to dispose of a dead clone
  sell(farm, crop, units) -> (frac, venue)
"""

import config as C


class BaseStrategy:
    name = "base"
    target_clones = 3
    fuel_mode = "wood"     # 'wood' (labor) or 'coal' (coin)
    buys_coal = True
    humane = True

    # -- lifecycle --
    def on_start(self, farm):
        pass

    def desired_fields(self):
        return max(C.START_FIELDS, self.target_clones * C.FIELDS_PER_WORKER)

    def clear_fields(self, farm):
        if len(farm.fields) < self.desired_fields() and farm.coin > 150:
            return 1
        return 0

    # -- planting: default rotates food crops --
    FOOD_ROTATION = ["potato", "wheat", "turnip", "potato", "corn"]

    def plant(self, farm, free_fields):
        picks = []
        for i, fl in enumerate(free_fields):
            picks.append(self._pick(farm, fl, i))
        return picks

    def _pick(self, farm, fl, i):
        # choose a food crop that grows this season; fallow if none affordable
        for crop in self.FOOD_ROTATION[i % len(self.FOOD_ROTATION):] + self.FOOD_ROTATION:
            if farm.season in C.CROPS[crop]["grow_seasons"] and farm.coin >= C.CROPS[crop]["seed"]:
                return crop
        return "fallow"

    # -- cruelty --
    def cruelty_sacrifices(self, farm):
        return 0

    # -- labor / clones --
    def buy_clone(self, farm):
        return len(farm.alive_clones) < self.target_clones and farm.coin > 130

    def will_buy_food(self, farm):
        return True

    def provision_winter(self, farm):
        target = C.FUEL_PER_WINTER * 1.3   # buffer for cold snaps
        fuel = 0.0
        if self.fuel_mode == "wood":
            fuel += min(target, farm.workers * C.WOOD_PER_CLONE_DAY * 4)
        if fuel < target and self.buys_coal:
            deficit = target - fuel
            coal = deficit / C.COAL_FUEL_VALUE
            cost = coal * C.COAL_PRICE
            if farm.coin >= cost:
                farm.coin -= cost
                fuel += deficit
        farm._fuel = fuel

    # -- disposal: humane by default --
    def disposal(self, farm):
        if self.humane and farm.coin >= 40:
            return "funeral"
        return "marked"

    # -- selling --
    def sell(self, farm, crop, units):
        fam = C.CROPS[crop]["family"]
        if fam == "weird":
            return 1.0, "black"
        if fam == "cash":
            return 1.0, "regional"
        # food crop: keep a reserve for winter, sell the surplus
        return 0.5, "regional"


class Subsistence(BaseStrategy):
    name = "subsistence"
    target_clones = 1
    fuel_mode = "wood"

    def buy_clone(self, farm):
        return len(farm.alive_clones) < 2 and farm.coin > 260

    def sell(self, farm, crop, units):
        # hold more food back; sell only a small surplus
        if C.CROPS[crop]["food"] > 0:
            return 0.35, "local"
        return 1.0, "regional"


class CashCrop(BaseStrategy):
    name = "cashcrop"
    target_clones = 4
    fuel_mode = "coal"     # coin-rich, labor-poor
    CASH_ROTATION = ["cotton", "tobacco", "hops"]

    def _pick(self, farm, fl, i):
        # keep one field in food, the rest in cash
        if i == 0:
            for crop in ["potato", "wheat"]:
                if farm.season in C.CROPS[crop]["grow_seasons"] and farm.coin >= C.CROPS[crop]["seed"]:
                    return crop
        for crop in self.CASH_ROTATION:
            if farm.season in C.CROPS[crop]["grow_seasons"] and farm.coin >= C.CROPS[crop]["seed"]:
                return crop
        return "fallow"


class BoneRootCruel(BaseStrategy):
    name = "boneroot_cruel"
    target_clones = 3
    fuel_mode = "coal"
    humane = False

    def cruelty_sacrifices(self, farm):
        # sacrifice a clone each growing season until a field is tainted enough
        if farm.is_winter:
            return 0
        max_taint = max((fl.taint for fl in farm.fields), default=0.0)
        if max_taint < 0.55 and len(farm.alive_clones) > 1:
            return 1
        return 0

    def _pick(self, farm, fl, i):
        if fl.taint >= 0.21 and farm.coin >= C.CROPS["bone_root"]["seed"]:
            return "bone_root"
        # otherwise a food crop to stay alive
        for crop in ["potato", "wheat"]:
            if farm.season in C.CROPS[crop]["grow_seasons"] and farm.coin >= C.CROPS[crop]["seed"]:
                return crop
        return "fallow"

    def disposal(self, farm):
        return "unmarked"

    def sell(self, farm, crop, units):
        if C.CROPS[crop]["family"] == "weird":
            return 1.0, "black"
        return 0.5, "local"


class Balanced(BaseStrategy):
    name = "balanced"
    target_clones = 3
    fuel_mode = "wood"
    ROTATION = ["potato", "wheat", "cotton", "turnip", "tobacco", "corn"]

    def _pick(self, farm, fl, i):
        for crop in self.ROTATION[i % len(self.ROTATION):] + self.ROTATION:
            if farm.season in C.CROPS[crop]["grow_seasons"] and farm.coin >= C.CROPS[crop]["seed"]:
                return crop
        return "fallow"


class RosterFixed(Balanced):
    """Balanced play pinned to a fixed roster size — used for the H-32 sweep."""
    def __init__(self, n):
        self.target_clones = n
        self.name = f"roster_{n}"


ALL_STRATEGIES = [Subsistence, CashCrop, BoneRootCruel, Balanced]
