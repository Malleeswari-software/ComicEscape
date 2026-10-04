/**
 * THE ESCAPE PROTOCOL: Shadows of the Forgotten
 * Comic Storylines, Panel Scripts, Dialogue, and Clue Configurations
 */

export const COMIC_DATA = {
  library: {
    id: 'library',
    chamber: 1,
    title: "The Tome of the Nameless Keeper",
    subtitle: "Archive Chronicle • Chapter I",
    coverImg: "assets/comic_library.jpg",
    narrativeIntro: "Centuries ago, the last Grand Archivist sealed three ancient grimoires to protect the Whispering Key. Only one who reads the darkness will reveal their sequence.",
    panels: [
      {
        num: 1,
        caption: "PANEL 1: THE OBSERVER'S OATH",
        speaker: "Archivist Vane",
        dialogue: "The archives whisper when the sun sets. The three sacred tomes must rest on their stones before midnight.",
        onomatopoeia: "CLIK-CLAK!",
        soundColor: "#facc15",
        hintDetail: "Notice the three stone lecterns on the central reading altar."
      },
      {
        num: 2,
        caption: "PANEL 2: THE SACRED HIERARCHY",
        speaker: "Archivist Vane",
        dialogue: "First soars the Golden Falcon through dawn's vault; next slithers the Silver Serpent through deep earth; last prowls the Azure Wolf beneath lunar shadow.",
        onomatopoeia: "WHIRRR!",
        soundColor: "#38bdf8",
        hintDetail: "Order of Sigils: 1. Falcon (Gold) ➔ 2. Serpent (Silver) ➔ 3. Wolf (Azure)."
      },
      {
        num: 3,
        caption: "PANEL 3: VEILED IN DARKNESS",
        speaker: "Narrator",
        dialogue: "To mortal eyes in white light, the binding seals sleep. Only under Ultraviolet radiance [2] will the hidden tome glyphs ignite!",
        onomatopoeia: "ZAP!",
        soundColor: "#a855f7",
        hintDetail: "Switch flashlight to UV mode [2] to verify the book glyphs on the tables."
      },
      {
        num: 4,
        caption: "PANEL 4: THE WHISPERING KEY",
        speaker: "Archivist Vane",
        dialogue: "When the trinity rests upon their rightful thrones, the Ornate Archive Cabinet releases its ancient brass latch!",
        onomatopoeia: "KRAAAK!",
        soundColor: "#22c55e",
        hintDetail: "The Cabinet against the North wall unlocks to yield Key 1."
      }
    ],
    uvClue: {
      title: "UV FLUORESCENCE CIPHER",
      glyph: "🦅 ➔ 🐍 ➔ 🐺",
      secretText: "SIGIL SEQUENCE: [I] FALCON  •  [II] SERPENT  •  [III] WOLF",
      instruction: "Arrange the three books on Reading Lecterns 1, 2, and 3 in this exact order."
    },
    hints: [
      {
        tier: 1,
        title: "Directional Hint",
        text: "Inspect the three pedestal bookstands on the long wooden reading table in the center of the library. There are three colored tomes on nearby desks."
      },
      {
        tier: 2,
        title: "Interpretation Hint",
        text: "The comic's second panel names the sacred order: Golden Falcon first, Silver Serpent second, and Azure Wolf third. Switch your flashlight to UV Blacklight [2] to inspect the books and identify their glowing sigils."
      },
      {
        tier: 3,
        title: "Solution Hint",
        text: "Press [E] on the reading table lecterns until: Lectern 1 holds the Falcon Book, Lectern 2 holds the Serpent Book, and Lectern 3 holds the Wolf Book. The Ornate Cabinet will open with Key 1!"
      }
    ]
  },

  observatory: {
    id: 'observatory',
    chamber: 2,
    title: "The Last Night of the Lost Constellation",
    subtitle: "Celestial Logbook • Chapter II",
    coverImg: "assets/comic_observatory.jpg",
    narrativeIntro: "Astronomer Nicholas tracked an impossible astral alignment across the heavens. His final warning: beware the phantom rogue star that leads wanderers astray.",
    panels: [
      {
        num: 1,
        caption: "PANEL 1: THE GLASS DOME",
        speaker: "Astronomer Nicholas",
        dialogue: "Tonight the heavens spin true. The constellation alignment requires concentrated starlight refracted through optical prisms.",
        onomatopoeia: "HUMMM!",
        soundColor: "#38bdf8",
        hintDetail: "Look up at the domed glass ceiling and the great brass telescope."
      },
      {
        num: 2,
        caption: "PANEL 2: THE TRUE PATHWAY",
        speaker: "Astronomer Nicholas",
        dialogue: "Trace from Phoenix through Orion, then upward to Cassiopeia. Beware! The Red Rogue Star is an optical decoy. IGNORE THE FALSE STAR!",
        onomatopoeia: "FLASH!",
        soundColor: "#ef4444",
        hintDetail: "True constellation pathway: Phoenix (45°) ➔ Orion ➔ Cassiopeia (135°)."
      },
      {
        num: 3,
        caption: "PANEL 3: OPTICAL DEFLECTION",
        speaker: "Nicholas's Journal",
        dialogue: "Mirror Alpha must catch the beam at 45 degrees, bending the light across the chamber to Mirror Beta set at 135 degrees.",
        onomatopoeia: "ZAP-BZZT!",
        soundColor: "#facc15",
        hintDetail: "Use Focused Laser [3] or align the telescope beam with Mirror Alpha and Mirror Beta."
      },
      {
        num: 4,
        caption: "PANEL 4: THE ASTRAL SPHERE",
        speaker: "Astronomer Nicholas",
        dialogue: "When starlight strikes the celestial wall glyph, the armillary vault opens to reveal the Astral Silver Key!",
        onomatopoeia: "WHIRRR-CLANG!",
        soundColor: "#22c55e",
        hintDetail: "Receptor glows celestial blue when hit, unlocking Key 2."
      }
    ],
    uvClue: {
      title: "CELESTIAL PRISM VECTOR",
      glyph: "✨ [45° ALPHA] ➔ [135° BETA] ➔ [ASTRAL GLYPH] ✨",
      secretText: "REFRACTION TARGET: ANGLE PRISM-ALPHA TO 45° • ANGLE PRISM-BETA TO 135°",
      instruction: "Approach each mirror pedestal and press [E] to rotate them until the beam hits the wall sensor."
    },
    hints: [
      {
        tier: 1,
        title: "Directional Hint",
        text: "Examine the two rotatable mirror pedestals on the observatory floor and the glowing star glyph receptor on the North wall."
      },
      {
        tier: 2,
        title: "Interpretation Hint",
        text: "Switch to Focused Laser Beam [3] or align the telescope. Panel 3 specifies the required angles: Mirror Alpha at 45° and Mirror Beta at 135° to guide the light around the central pillar."
      },
      {
        tier: 3,
        title: "Solution Hint",
        text: "Press [E] facing Mirror Alpha until it reads 45°. Press [E] facing Mirror Beta until it reads 135°. Aim your laser at Mirror Alpha. The light will bounce into the Astral Glyph on the wall and open the key vault!"
      }
    ]
  },

  temple: {
    id: 'temple',
    chamber: 3,
    title: "The Final Shadow of the Sun and Moon",
    subtitle: "Sanctuary Inscription • Chapter III",
    coverImg: "assets/comic_temple.jpg",
    narrativeIntro: "The ancient temple guards the Obsidian Key in a sanctuary of perpetual twilight. Neither blazing fire nor complete darkness can breach its seal—only harmony.",
    panels: [
      {
        num: 1,
        caption: "PANEL 1: THE GUARDIAN STATUES",
        speaker: "Explorer Elena",
        dialogue: "Three colossal stone pharaohs stand watch in the gloom. Their elongated shadows stretch toward the ceremonial altar.",
        onomatopoeia: "SHHH...",
        soundColor: "#94a3b8",
        hintDetail: "Notice the shadows cast by the statues on the stone floor."
      },
      {
        num: 2,
        caption: "PANEL 2: THE DUAL BRAZIERS",
        speaker: "Elena's Notes",
        dialogue: "To the east burns the Sun Brazier; to the west smolders the Moon Brazier. Both cast shadows that converge upon the altar.",
        onomatopoeia: "FWOOSH!",
        soundColor: "#f97316",
        hintDetail: "Interact with Brazier Sol and Brazier Luna to tune their flame intensity."
      },
      {
        num: 3,
        caption: "PANEL 3: THE LAW OF BALANCE",
        speaker: "Temple Inscription",
        dialogue: "Too much light washes out the sacred eclipse sigil. Too much shadow swallows it whole. Balance both flame sources at equal equilibrium!",
        onomatopoeia: "HUMMM...",
        soundColor: "#a855f7",
        hintDetail: "Adjust both braziers until shadow and light meet at the 50/50 balance point."
      },
      {
        num: 4,
        caption: "PANEL 4: THE OBSIDIAN KEY",
        speaker: "Explorer Elena",
        dialogue: "The eclipse glyph ignites in golden-violet fire! The stone altar slides back, revealing the third and final key!",
        onomatopoeia: "CRRR-RAAACK!",
        soundColor: "#22c55e",
        hintDetail: "Take Key 3 and proceed to the Master Exit Portal."
      }
    ],
    uvClue: {
      title: "SHADOW HARMONY INSCRIPTION",
      glyph: "☀️ ⚖️ 🌙",
      secretText: "EQUILIBRIUM: BRAZIER SOL (50%) = BRAZIER LUNA (50%)",
      instruction: "Adjust both flame braziers until the shadow intersection reveals the Solar-Lunar Eclipse Glyph."
    },
    hints: [
      {
        tier: 1,
        title: "Directional Hint",
        text: "Look at the two stone fire braziers flanking the central altar: Brazier Sol on the right and Brazier Luna on the left."
      },
      {
        tier: 2,
        title: "Interpretation Hint",
        text: "The comic explains: 'Too much light washes out the sigil; too much shadow swallows it.' The altar needs equal balance between light and shadow from both sides."
      },
      {
        tier: 3,
        title: "Solution Hint",
        text: "Press [E] on Brazier Sol and Brazier Luna until both are set to Balanced Flame (50%). The Solar-Lunar Glyph on the altar will illuminate, sliding the stone lid open to reveal Key 3!"
      }
    ]
  }
};
