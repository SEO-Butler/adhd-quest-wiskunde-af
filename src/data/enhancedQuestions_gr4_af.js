export const enhancedQuestions = [
  {
    "id": "wisk-breuke-enhanced-1",
    "subject": "Wiskunde",
    "topic": "Ekwivalente breuke",
    "type": "mcq",
    "prompt": "Watter breuk is ekwivalent aan 1/2?",
    "ttsInstruction": "Luister mooi na hierdie vraag oor ekwivalente breuke. Onthou dat ekwivalente breuke dieselfde waarde het, maar verskillende tellers en noemers. Die vraag is: Watter een van hierdie vier breuke het presies dieselfde waarde as een helfte? Dink stadig en sorgvuldig oor elke opsie.",
    "options": [
      "2/3",
      "3/6", 
      "2/5",
      "1/3"
    ],
    "answerIndex": 1,
    "difficulty": 1,
    "hint": "As jy bo en onder met dieselfde getal vermenigvuldig, bly die breuk dieselfde waarde.",
    "explanation": "3/6 is dieselfde as 1/2 omdat 3 ÷ 6 = 0,5 en 1 ÷ 2 = 0,5. Hulle is ekwivalent."
  },
  {
    "id": "wisk-breuke-enhanced-2", 
    "subject": "Wiskunde",
    "topic": "Verskillende soorte breuke",
    "type": "mcq",
    "prompt": "Watter soort breuk is 7/4?",
    "ttsInstruction": "Kom ons kyk na hierdie breuk: sewe vierdes. Onthou daar is verskillende soorte breuke. 'n Egte breuk het 'n kleiner teller as noemer. 'n Onegte breuk het 'n groter teller as noemer. 'n Gemengde getal het 'n heelgetal en 'n breuk saam. Watter soort is sewe vierdes?",
    "options": [
      "Egte breuk",
      "Onegte breuk", 
      "Gemengde getal",
      "Desimale getal"
    ],
    "answerIndex": 1,
    "difficulty": 1,
    "hint": "Vergelyk die teller (7) met die noemer (4). Watter een is groter?",
    "explanation": "7/4 is 'n onegte breuk omdat die teller (7) groter is as die noemer (4)."
  },
  {
    "id": "wisk-breuke-enhanced-3",
    "subject": "Wiskunde", 
    "topic": "Gemengde getalle",
    "type": "short",
    "prompt": "Skryf 9/4 as 'n gemengde getal.",
    "ttsInstruction": "Hierdie vraag vra jou om 'n onegte breuk om te skakel na 'n gemengde getal. Nege vierdes moet jy skryf as 'n heelgetal plus 'n egte breuk. Dink aan dit so: Hoeveel keer gaan vier in nege in? Wat bly oor?",
    "acceptableAnswers": [
      "2 1/4",
      "2¼", 
      "2 1/4 "
    ],
    "difficulty": 2,
    "hint": "Deel 9 deur 4. Die antwoord is die heelgetal deel, en die res word die nuwe teller.",
    "explanation": "9 ÷ 4 = 2 res 1, dus 9/4 = 2 1/4."
  },
  {
    "id": "wisk-geld-enhanced-1",
    "subject": "Wiskunde",
    "topic": "Woordsomme met geld",
    "type": "numeric", 
    "prompt": "Emma koop 4 appels teen N$2,50 elk. Hoeveel betaal sy altesaam?",
    "ttsInstruction": "Hier is 'n woordsom oor geld. Emma gaan na die winkel toe. Sy wil appels koop. Elke appel kos twee rand en vyftig sent. Sy koop vier appels altesaam. Jy moet uitwerk hoeveel geld sy altesaam moet betaal vir al vier die appels. Onthou om sorgvuldig te reken.",
    "answerNumeric": 10,
    "tolerance": 0.01,
    "difficulty": 1,
    "hint": "Vermenigvuldig die aantal appels met die prys per appel: 4 × N$2,50",
    "explanation": "4 appels × N$2,50 elk = N$10,00"
  },
  {
    "id": "wisk-geld-enhanced-2",
    "subject": "Wiskunde",
    "topic": "Kleingeld bereken",
    "type": "numeric",
    "prompt": "Sarah koop 'n boek vir N$35,75. Sy gee N$50. Hoeveel kleingeld kry sy?",
    "ttsInstruction": "Sarah is by die boekwinkel. Sy het 'n mooi boek gekies wat vyf en dertig rand en vyf en sewentig sent kos. Sy het net 'n vyftig rand note in haar beursie. Sy gee die vyftig rand vir die boek. Die kassier moet vir haar kleingeld gee. Hoeveel kleingeld sal Sarah ontvang?",
    "answerNumeric": 14.25,
    "tolerance": 0.01,
    "difficulty": 1,
    "hint": "Trek die prys van die boek af van die geld wat sy gegee het: N$50 - N$35,75",
    "explanation": "N$50,00 - N$35,75 = N$14,25 kleingeld"
  },
  {
    "id": "wisk-tyd-enhanced-1",
    "subject": "Wiskunde",
    "topic": "Tydsberekeninge",
    "type": "short",
    "prompt": "Die fliek begin om 14:30 en is 2 uur en 45 minute lank. Wanneer eindig dit?",
    "ttsInstruction": "Kom ons werk met tyd. Piet gaan na die bioskoop toe. Die fliek wat hy wil kyk begin om half drie in die middag - dit is veertien dertig in vier en twintig uur tyd. Die fliek is twee uur en vyf en veertig minute lank. Jy moet uitwerk op watter tyd die fliek sal klaar wees.",
    "acceptableAnswers": [
      "17:15",
      "5:15 PM", 
      "17h15",
      "kwart oor 5"
    ],
    "difficulty": 2,
    "hint": "Tel 2 uur en 45 minute by 14:30. Onthou 60 minute = 1 uur",
    "explanation": "14:30 + 2h45min = 17:15"
  },
  {
    "id": "wisk-massa-enhanced-1", 
    "subject": "Wiskunde",
    "topic": "Massa en gewig",
    "type": "numeric",
    "prompt": "Anna weeg 3 kg 450 g appels af. Hoeveel gram is dit altesaam?",
    "ttsInstruction": "Anna help haar ma in die kombuis. Sy moet appels afweeg vir 'n appeltert. Die skaal wys drie kilogram en vier honderd en vyftig gram. Jy moet hierdie massa omskakel na net gram. Onthou dat een kilogram gelyk is aan een duisend gram.",
    "answerNumeric": 3450,
    "tolerance": 0,
    "difficulty": 1, 
    "hint": "Skakel kilogram om na gram: 1 kg = 1000 g. Tel dan die gram by mekaar op.",
    "explanation": "3 kg = 3000 g, plus 450 g = 3450 g altesaam"
  },
  {
    "id": "wisk-volume-enhanced-1",
    "subject": "Wiskunde", 
    "topic": "Volume en kapasiteit",
    "type": "numeric",
    "prompt": "Hennie skink 2,5 liter sap in glase van 250 ml elk. Hoeveel glase kan hy vol maak?",
    "ttsInstruction": "Hennie hou 'n partytjie en hy moet sap vir sy vriende inskink. Hy het twee en 'n half liter vrugtesap in 'n groot bottef. Hy het klein glase wat elk twee honderd en vyftig milliliter kan hou. Jy moet uitwerk hoeveel glase hy vol kan maak met al die sap wat hy het.",
    "answerNumeric": 10,
    "tolerance": 0,
    "difficulty": 2,
    "hint": "Skakel eers alles om na dieselfde eenheid. 2,5 liter = 2500 ml. Deel dan deur 250 ml.",
    "explanation": "2,5 l = 2500 ml ÷ 250 ml per glas = 10 glase"
  },
  {
    "id": "wisk-meetkunde-enhanced-1",
    "subject": "Wiskunde",
    "topic": "Perimeter",  
    "type": "numeric",
    "prompt": "Bereken die perimeter van 'n reghoek: lengte 8 cm, breedte 5 cm.",
    "ttsInstruction": "'n Reghoek het vier sye. Twee lang sye wat die lengte is, en twee kort sye wat die breedte is. Hierdie reghoek het 'n lengte van agt sentimeter en 'n breedte van vyf sentimeter. Die perimeter is die totale afstand rondom die buitekant van die vorm. Jy moet al vier sye bymekaar tel.",
    "answerNumeric": 26,
    "tolerance": 0,
    "difficulty": 1,
    "hint": "Perimeter van reghoek = 2 × lengte + 2 × breedte",
    "explanation": "Perimeter = 2×8 + 2×5 = 16 + 10 = 26 cm"
  },
  {
    "id": "wisk-statistiek-enhanced-1",
    "subject": "Wiskunde", 
    "topic": "Gemiddelde",
    "type": "numeric",
    "prompt": "Lisa se toetspunte: 85, 78, 92, 80, 85. Wat is haar gemiddelde punt?",
    "ttsInstruction": "Lisa het vyf toetse geskryf hierdie kwartaal. Sy het die volgende punte behaal: vyf en tagtig, agt en sewentig, twee en negentig, tagtig, en weer vyf en tagtig. Om haar gemiddelde punt uit te werk, moet jy al die punte bymekaar tel en dan deel deur die aantal toetse.",
    "answerNumeric": 84,
    "tolerance": 0,
    "difficulty": 2,
    "hint": "Tel al die punte bymekaar op en deel deur 5 (die aantal toetse).",
    "explanation": "(85 + 78 + 92 + 80 + 85) ÷ 5 = 420 ÷ 5 = 84"
  }
];