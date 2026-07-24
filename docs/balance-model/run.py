#!/usr/bin/env python3
"""
Bushel & Bone — Balance Model: CLI entry point.

Usage:
  python run.py                       # run the hypothesis suite (default)
  python run.py hypotheses
  python run.py sim  --strategy cashcrop --seed 1
  python run.py compare --seeds 40    # strategy comparison table

Stdlib only — no pip install required. Python 3.8+.
"""

import argparse
import statistics as stats

import strategies as S
from model import run_campaign
from hypotheses import run_suite, print_report

STRATS = {
    "subsistence": S.Subsistence,
    "cashcrop": S.CashCrop,
    "boneroot": S.BoneRootCruel,
    "balanced": S.Balanced,
}


def cmd_hypotheses(_args):
    print_report(run_suite())


def cmd_sim(args):
    cls = STRATS.get(args.strategy)
    if not cls:
        print(f"unknown strategy '{args.strategy}'. choices: {', '.join(STRATS)}")
        return
    m = run_campaign(cls(), args.seed)
    print(f"strategy={args.strategy}  seed={args.seed}")
    for k, v in m.items():
        print(f"  {k:20} {v}")


def cmd_compare(args):
    seeds = list(range(1, args.seeds + 1))
    print("=" * 78)
    print(f"STRATEGY COMPARISON  ({len(seeds)} seeds each)")
    print("=" * 78)
    header = f"{'strategy':14} {'mean yrs':>9} {'mean earn':>10} {'died<=Y3':>9} {'end-reasons'}"
    print(header)
    print("-" * 78)
    for name, cls in STRATS.items():
        ms = [run_campaign(cls(), s) for s in seeds]
        yrs = stats.mean(m["years_survived"] for m in ms)
        earn = stats.mean(m["total_coin_earned"] for m in ms)
        early = sum(1 for m in ms if m["years_survived"] <= 3) / len(ms)
        reasons = {}
        for m in ms:
            reasons[m["end_reason"]] = reasons.get(m["end_reason"], 0) + 1
        rstr = ", ".join(f"{k}:{v}" for k, v in sorted(reasons.items(), key=lambda kv: -kv[1]))
        print(f"{name:14} {yrs:9.1f} {earn:10.0f} {early:9.0%}  {rstr}")
    print("=" * 78)
    print("Read: no single strategy should dominate on BOTH survival and earnings.")


def main():
    p = argparse.ArgumentParser(description="Bushel & Bone Balance Model")
    sub = p.add_subparsers(dest="cmd")

    sub.add_parser("hypotheses", help="run the hypothesis suite (default)")

    ps = sub.add_parser("sim", help="run one campaign, verbose")
    ps.add_argument("--strategy", default="balanced", choices=list(STRATS))
    ps.add_argument("--seed", type=int, default=1)

    pc = sub.add_parser("compare", help="compare all strategies")
    pc.add_argument("--seeds", type=int, default=40)

    args = p.parse_args()
    if args.cmd == "sim":
        cmd_sim(args)
    elif args.cmd == "compare":
        cmd_compare(args)
    else:
        cmd_hypotheses(args)


if __name__ == "__main__":
    main()
