// Draft adaptation of the opening of Chapter 1; not a full-chapter adaptation.
import {createDramaEpisodePlan} from './episode-plan.mjs';
export const pilotInput = {
  "title": "THE GLASS THRONE — The Email",
  "sourceChapterIds": [
    "chapter01"
  ],
  "targetSeconds": 180,
  "aspectRatio": "16:9",
  "shots": [
    {
      "id": "s01",
      "durationSeconds": 15,
      "description": "Exterior glass towers at late afternoon; slow approach to headquarters.",
      "characterIds": [
        "narrator"
      ],
      "dialogue": [
        {
          "characterId": "narrator",
          "text": "Monday afternoon. On the forty-second floor, the leadership forum was about to begin."
        }
      ]
    },
    {
      "id": "s02",
      "durationSeconds": 20,
      "description": "Auditorium; executives close laptops; Daniel takes an aisle seat.",
      "characterIds": [
        "narrator"
      ],
      "dialogue": [
        {
          "characterId": "narrator",
          "text": "Daniel Mercer watched the room, close enough to see the stage without drawing attention."
        }
      ]
    },
    {
      "id": "s03",
      "durationSeconds": 25,
      "description": "Richard alone at lectern; cut to Daniel and the silent audience.",
      "characterIds": [
        "richard"
      ],
      "dialogue": [
        {
          "characterId": "richard",
          "text": "At the end of this fiscal year, I will step down as chief executive officer."
        }
      ]
    },
    {
      "id": "s04",
      "durationSeconds": 25,
      "description": "Reaction montage: Jonathan remains still; Caroline lowers her pen; Marcus on London video screen.",
      "characterIds": [
        "narrator"
      ],
      "dialogue": [
        {
          "characterId": "narrator",
          "text": "Jonathan did not move. Caroline stopped writing. Marcus looked as though he had heard it all before."
        }
      ]
    },
    {
      "id": "s05",
      "durationSeconds": 30,
      "description": "Richard resumes speaking; restrained medium shot and audience reactions.",
      "characterIds": [
        "richard"
      ],
      "dialogue": [
        {
          "characterId": "richard",
          "text": "The board has established a succession committee. The process will be deliberate, independent, and appropriately confidential. Until a successor is appointed, our priorities do not change."
        }
      ]
    },
    {
      "id": "s06",
      "durationSeconds": 30,
      "description": "Applause spreads from front row; executives linger and approach Jonathan.",
      "characterIds": [
        "narrator"
      ],
      "dialogue": [
        {
          "characterId": "narrator",
          "text": "The applause lasted longer than Daniel expected. Nobody seemed in a hurry to leave."
        }
      ]
    },
    {
      "id": "s07",
      "durationSeconds": 25,
      "description": "Daniel observes a managing director crossing rows to shake Jonathan's hand.",
      "characterIds": [
        "daniel"
      ],
      "dialogue": [
        {
          "characterId": "daniel",
          "text": "Nothing changes faster than a company after someone important says the priorities do not change."
        }
      ]
    },
    {
      "id": "s08",
      "durationSeconds": 10,
      "description": "Fade to title THE GLASS THRONE; restrained musical ending.",
      "characterIds": [],
      "dialogue": []
    }
  ]
};
export const createGlassThronePilot = ()=>createDramaEpisodePlan(pilotInput);
