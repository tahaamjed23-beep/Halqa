# -*- coding: utf-8 -*-
"""Three dimensional figures for the six maths models. Colour marks the decision each region leads to."""
import math
import os

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Patch
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
FIGS = os.path.join(HERE, 'out', 'figs')
os.makedirs(FIGS, exist_ok=True)
GREEN, AMBER, RED, BLUE, ORANGE, LIGHT = '#2E7D32', '#F2A900', '#C62828', '#1F5FAD', '#E07B00', '#7CB342'
plt.rcParams.update({'font.family': 'Calibri', 'font.size': 9, 'axes.labelsize': 9, 'axes.titlesize': 10})


def _axes():
    fig = plt.figure(figsize=(7.4, 4.9), dpi=200)
    ax = fig.add_subplot(111, projection='3d')
    ax.xaxis.pane.set_facecolor('#FFFFFF')
    ax.yaxis.pane.set_facecolor('#FFFFFF')
    ax.zaxis.pane.set_facecolor('#FFFFFF')
    ax.grid(True)
    return fig, ax


def _save(fig, name, handles, loc='upper left'):
    fig.legend(handles=handles, loc=loc, frameon=False, fontsize=8)
    fig.tight_layout()
    path = os.path.join(FIGS, name)
    fig.savefig(path, facecolor='white')
    plt.close(fig)
    return path


def hyper_stress():
    N, n, c, P, C = 50, 400, 300.0, 15000.0, 120000.0
    d = np.arange(1, N + 1, dtype=float)
    D = np.arange(0, 17, dtype=float)
    X, Y = np.meshgrid(d, D)
    tbar = np.maximum(1, X / 2)
    E = Y * c * (N - tbar)
    f1 = np.minimum(1, E / (C + P))
    f2 = np.minimum(1, Y / (C / P))
    f3 = np.minimum(1, 2 * X / n)
    f4 = np.minimum(1, np.minimum(6, np.round(Y / 2)) / 6)
    f5 = X / N
    Z = 100 * (0.45 * f1 + 0.20 * f2 + 0.15 * f3 + 0.10 * f4 + 0.10 * f5)
    col = np.where(Z >= 67, RED, np.where(Z >= 34, AMBER, GREEN))
    fig, ax = _axes()
    ax.plot_surface(X, Y, Z, facecolors=col, rstride=1, cstride=1, linewidth=0.1, edgecolor='#555555', shade=False, alpha=0.95)
    ax.set_xlabel('Day of the cycle')
    ax.set_ylabel('Defaults after collection')
    ax.set_zlabel('Stress index')
    ax.set_zlim(0, 100)
    ax.view_init(elev=24, azim=-128)
    return _save(fig, 'hyper-stress.png', [Patch(color=GREEN, label='Green, 0 to 33: normal operation'),
                                          Patch(color=AMBER, label='Amber, 34 to 66: new joins blocked'),
                                          Patch(color=RED, label='Red, 67 to 100: next day not opened')])


def affordability():
    Yv = np.linspace(20000, 150000, 53)
    B = np.linspace(0, 40000, 41)
    X, Y = np.meshgrid(Yv, B)
    held = 5000.0
    t1 = 0.33 * X - held
    t2 = 0.40 * X - held - Y
    Z = np.maximum(0, np.minimum(t1, t2))
    col = np.where(Z <= 0, RED, np.where(t1 <= t2, BLUE, ORANGE))
    fig, ax = _axes()
    ax.plot_surface(X / 1000, Y / 1000, Z / 1000, facecolors=col, rstride=1, cstride=1, linewidth=0.05, edgecolor='#666666', shade=False)
    ax.set_xlabel('Verified income a month (Rs 000)')
    ax.set_ylabel('Other loan repayments a month (Rs 000)')
    ax.set_zlabel('Room for a new instalment (Rs 000)')
    ax.view_init(elev=26, azim=-132)
    return _save(fig, 'affordability.png', [Patch(color=BLUE, label='Limited by the one third test on committees'),
                                           Patch(color=ORANGE, label='Limited by the 40 per cent test with loans'),
                                           Patch(color=RED, label='No room: the member cannot join')])


def income_account():
    rng = np.random.default_rng(7)
    k = 900
    rec = rng.choice([0.25, 0.5, 0.75, 1.0], size=k, p=[0.12, 0.18, 0.25, 0.45]) + rng.normal(0, 0.02, k)
    amt = np.clip(rng.beta(4, 1.6, k), 0, 1)
    day = np.clip(rng.beta(3.5, 1.4, k), 0, 1)
    nar = rng.random(k) < 0.55
    emp = rng.random(k) < 0.6
    S = 0.35 * np.clip(rec, 0, 1) + 0.25 * amt + 0.20 * day + 0.10 * nar + 0.10 * emp
    col = np.where(S >= 0.75, GREEN, np.where(S >= 0.50, AMBER, RED))
    fig, ax = _axes()
    ax.scatter(np.clip(rec, 0, 1), amt, day, c=col, s=7, depthshade=False, edgecolors='none')
    ax.set_xlabel('Recurrence: months with a credit')
    ax.set_ylabel('Amount steady within 15 per cent')
    ax.set_zlabel('Day steady within 3 days')
    ax.view_init(elev=20, azim=-60)
    return _save(fig, 'income-account.png', [Patch(color=GREEN, label='Score 0.75 or more: verified'),
                                            Patch(color=AMBER, label='0.50 to 0.75: manual review'),
                                            Patch(color=RED, label='Below 0.50: not verified')])


def identity():
    g = np.linspace(0.70, 1.00, 9)
    N_, F_, A_ = np.meshgrid(g, g, g)
    K = 0.25 * N_ + 0.25 * F_ + 0.15 * A_ + 0.15 * 1.0 + 0.10 * 1.0 + 0.10 * 0.8
    col = np.where(K >= 0.92, GREEN, np.where(K >= 0.85, AMBER, RED))
    fig, ax = _axes()
    ax.scatter(N_.ravel(), F_.ravel(), A_.ravel(), c=col.ravel(), s=16, depthshade=False, edgecolors='none')
    ax.set_xlabel('Name similarity')
    ax.set_ylabel('Face match')
    ax.set_zlabel('Address match')
    ax.view_init(elev=22, azim=-55)
    return _save(fig, 'identity.png', [Patch(color=GREEN, label='K 0.92 or more: level 3, Hyper'),
                                      Patch(color=AMBER, label='K 0.85 to 0.92: level 2, unknown committees'),
                                      Patch(color=RED, label='Below 0.85: not enough for an unknown committee')])


def takaful():
    p = np.linspace(0.01, 0.10, 46)
    w = np.linspace(0.10, 0.35, 26)
    X, Y = np.meshgrid(p, w)
    per_inst = 12 * X * 55000.0 / 144
    Z = per_inst * 1.2 / (1 - Y)
    share = Z / 10000.0
    col = np.where(share > 0.06, RED, np.where(share >= 0.03, AMBER, GREEN))
    fig, ax = _axes()
    ax.plot_surface(X * 100, Y * 100, Z, facecolors=col, rstride=1, cstride=1, linewidth=0.05, edgecolor='#666666', shade=False)
    ax.set_xlabel('Default rate after collection (%)')
    ax.set_ylabel('Operator wakalah fee (%)')
    ax.set_zlabel('Contribution per Rs 10,000 (Rs)')
    ax.view_init(elev=24, azim=-125)
    return _save(fig, 'takaful.png', [Patch(color=GREEN, label='Under 3 per cent of the instalment'),
                                     Patch(color=AMBER, label='3 to 6 per cent'),
                                     Patch(color=RED, label='Over 6 per cent')])


def credit():
    s = np.linspace(300, 850, 56)
    pdo = np.linspace(20, 60, 21)
    X, Y = np.meshgrid(s, pdo)
    factor = Y / math.log(2)
    offset = 700 - factor * math.log(30)
    odds = np.exp((X - offset) / factor)
    Z = 100.0 / (1 + odds)
    col = np.where(X >= 750, GREEN, np.where(X >= 650, LIGHT, np.where(X >= 550, AMBER, RED)))
    fig, ax = _axes()
    ax.plot_surface(X, Y, Z, facecolors=col, rstride=1, cstride=1, linewidth=0.05, edgecolor='#666666', shade=False)
    ax.set_xlabel('Halqa score')
    ax.set_ylabel('Points to double the odds')
    ax.set_zlabel('Chance of default (%)')
    ax.view_init(elev=24, azim=-58)
    return _save(fig, 'credit.png', [Patch(color=GREEN, label='Excellent, 750 and above'),
                                    Patch(color=LIGHT, label='Good, 650 to 749'),
                                    Patch(color=AMBER, label='Fair, 550 to 649'),
                                    Patch(color=RED, label='Rebuilding, below 550')])


def asset_exposure():
    n, c, A = 12, 10000.0, 120000.0
    j = np.arange(0, 13, dtype=float)
    r = np.linspace(0.50, 0.90, 21)
    X, Y = np.meshgrid(j, r)
    Z = np.maximum(0.0, c * (n - X) - Y * A)
    col = np.where(Z <= 0, GREEN, np.where(Z <= 0.10 * A, AMBER, RED))
    fig, ax = _axes()
    ax.plot_surface(X, Y * 100, Z / 1000, facecolors=col, rstride=1, cstride=1, linewidth=0.05, edgecolor='#666666', shade=False)
    ax.set_xlabel('Rentals paid before default')
    ax.set_ylabel('Recovery on resale (% of price)')
    ax.set_zlabel("Modaraba's exposure (Rs 000)")
    ax.view_init(elev=24, azim=-130)
    return _save(fig, 'asset-exposure.png', [Patch(color=GREEN, label='Nil: the asset covers what is owed'),
                                            Patch(color=AMBER, label='Up to 10 per cent of the price'),
                                            Patch(color=RED, label='Above 10 per cent of the price')])


def swap_cost():
    k = np.arange(1, 12, dtype=float)
    fee = np.array([100.0, 150.0, 200.0, 300.0, 400.0, 500.0])
    X, Y = np.meshgrid(k, fee)
    pts = np.select([X <= 2, X <= 4, X <= 6, X <= 8], [250.0, 500.0, 1000.0, 1500.0], 2000.0)
    Z = X * Y + pts - 500.0
    cap = 0.10 * 144 * Y
    col = np.where(Z <= 0.5 * cap, GREEN, np.where(Z <= cap, AMBER, RED))
    fig, ax = _axes()
    ax.plot_surface(X, Y, Z, facecolors=col, rstride=1, cstride=1, linewidth=0.05, edgecolor='#666666', shade=False)
    ax.set_xlabel('Seats moved')
    ax.set_ylabel('Fee per instalment (Rs)')
    ax.set_zlabel('Net cost of one exchange to Halqa (Rs)')
    ax.view_init(elev=24, azim=-128)
    return _save(fig, 'swap-cost.png', [Patch(color=GREEN, label='Within half the circle cap: offered'),
                                       Patch(color=AMBER, label='Within the circle cap: offered once'),
                                       Patch(color=RED, label='Above the cap of a 12 member circle: not offered')])


def forward_liability():
    fig, ax = _axes()
    c = 10000.0
    for n in range(6, 25, 2):
        for k in range(1, n + 1):
            colr = GREEN if k > n - 3 else (AMBER if k > n / 2 else RED)
            h = c * (n - k) / 1000
            ax.bar3d(n - 0.8, k - 0.4, 0, 1.6, 0.8, max(h, 0.4), color=colr, edgecolor='#555555', linewidth=0.15, shade=False)
    ax.set_xlabel('Members in the circle')
    ax.set_ylabel('Seat collected')
    ax.set_zlabel('Still owed after collecting (Rs 000)')
    ax.view_init(elev=30, azim=38)
    return _save(fig, 'forward-liability.png', [Patch(color=GREEN, label='Last three seats: open to new members'),
                                               Patch(color=AMBER, label='Second half: Fair band or better'),
                                               Patch(color=RED, label='First half: Good or Excellent band only')])


def rail_share():
    inst = np.linspace(500, 30000, 60)
    rate = np.linspace(0.005, 0.02, 16)
    X, Y = np.meshgrid(inst, rate)
    fee = np.where(X <= 2500, 100.0, np.where(X <= 5000, 150.0, np.where(X <= 10000, 300.0, 500.0)))
    Z = 100 * (X * Y) / fee
    col = np.where(Z <= 10, GREEN, np.where(Z <= 30, AMBER, RED))
    fig, ax = _axes()
    ax.plot_surface(X / 1000, Y * 100, np.minimum(Z, 120), facecolors=col, rstride=1, cstride=1, linewidth=0.05, edgecolor='#666666', shade=False)
    ax.set_xlabel('Instalment (Rs 000)')
    ax.set_ylabel('Percentage charge on the debit (%)')
    ax.set_zlabel('Charge as a share of the fee (%)')
    ax.view_init(elev=24, azim=-132)
    return _save(fig, 'rail-share.png', [Patch(color=GREEN, label='Up to 10 per cent of the fee'),
                                        Patch(color=AMBER, label='10 to 30 per cent'),
                                        Patch(color=RED, label='Over 30 per cent: a per transaction price is needed')])


def bm_first_circle(X, Y, Z):
    """X members, Y instalment in rupees, Z first circle contribution per payment in rupees."""
    col = np.where(Z < 0, RED, np.where(Z <= 50, AMBER, GREEN))
    fig, ax = _axes()
    ax.plot_surface(X, Y / 1000, Z, facecolors=col, rstride=1, cstride=1, linewidth=0.05, edgecolor='#666666', shade=False)
    ax.set_xlabel('Members in the circle')
    ax.set_ylabel('Instalment (Rs 000)')
    ax.set_zlabel('First circle result per payment (Rs)')
    ax.view_init(elev=24, azim=-135)
    return _save(fig, 'bm-first-circle.png', [Patch(color=GREEN, label='Above Rs 50 a payment'),
                                             Patch(color=AMBER, label='Rs 0 to 50 a payment'),
                                             Patch(color=RED, label='Loss in the first circle, recovered in the second')])


ALL = {'hyper': hyper_stress, 'afford': affordability, 'income': income_account, 'identity': identity,
       'takaful': takaful, 'credit': credit,
       'asset': asset_exposure, 'swap': swap_cost, 'liability': forward_liability, 'rail': rail_share}

if __name__ == '__main__':
    for k, f in ALL.items():
        print(k, f())
