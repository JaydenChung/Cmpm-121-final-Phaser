# F3.DevLog 

## How we satisfied the software requirements
### F0+F1+F2

For the latest version of our software, no major changes for F0, F1, F2 were made as we wanted to keep our functionalties relatively the same with some added features. The game should work normally in terms of plant functions, save states, and user interface. Therefore, the requirements for F0, F1, and F2 should still be satisfied. 

### Internationalization

In order to input other languages into our game design, we first had to create an array of language interface. In each item, there would be the name of the array and the translations that would display valuable information such as movement or warnings to the user. One instance of a language interface can look like this: 
```
{
    language: "Arabic",
    translations: {
        "movedup": "تحرك للأعلى",
        "moveddown": "تحرك للأسفل",
        "movedleft": "تحرك لليسار",
        "movedright": "تحرك لليمين",
        "turn": "الدورة: ",
        "score": "النقاط: ",
        "sun": "الشمس: ",
        "water": "الماء: ",
        "maxPlantsError": "يمكن وضع 3 نباتات كحد أقصى في كل دورة",
        "occupiedCellError": "لا يمكن وضع نبات في خلية مشغولة",
        "adjacentPlantError": "يمكنك وضع النباتات فقط بجانب اللاعب",
        "reapTreeError": "يمكنك فقط حصاد النباتات في المرحلة النهائية (الأشجار)",
        "gameFinished": "اللعبة انتهت، مجموع النباتات المزروعة: "
    }
}
```

From that point, it was a matter of creating input elements such as buttons that will allow the user to switch languages in our game. Depending on the user input, the translator in GameScene.js will check if the language data from StartScene.js has sucessfully passed. Once passed, the game should now be translated to the user's selected language. 

### Localization

Our game supports three languages which are English, Chinese and Arabic. The process of implementing these languages starting off with the English text that was already present in our original design. We did not know anyone who were fluent with the languages that were selected. Because of this, we used ChatGPT so that the AI can auto-translate into another language. We decided to go for this approach in translation because we only needed to translate basic messages and titles. The prompts simply asking ChatGPT to translate the English text into Chinese and Arabic. 

The game starts at the StartScene.js which displays the three buttons for each language. This allows the user to change the language setting inside the game. Our game should be able to support three languages into one version instead of three different hard-coded languages. The selection of languages should be straightforward for our players as it will be the first thing they see when opening the game. 

### Mobile Installation

We used progressive web apps (PWA) that allows mobile player to install the game which can be played locally or offline. A tutorial from [Scott Westover](https://gamedevacademy.org/phaser-progressive-web-apps-tutorial/) was valuable in understanding how to make our phaser game installable to mobile devices. Somes changes needed to be made where an web app manifest had to be added for PWA to work. 

### Mobile Play (Offline)

The dimensions of screen size were adjusted to fit vertically for mobile user. Also, all of the key inputs that were initially used for controlling the game had to be translated to display buttons for mobile users. This meant that we had to edit the index.html to create multiple buttons to represent each key input and making sure that on click will do the exact same function. There were no changes for the game to be playable in offline cases so it should be able to play with or without wifi. 

## Reflection

The workload amongst the group had to split in order to fulfill the F3 requirements where each member would focus on a particular mechanic such as language translation, mobile controls, mobile installation, etc. We have not reconsidered our tools as using phaser/javascript made it simple to implement the game into a mobile platform. As for the roles, they were not heavily enforced as it was easier for one member who is capability of doing one of the requirements to work on a specific design. Our game has evolved into reaching a wider audience with the implementation of three languages that will help players understand how to navigate in Graceful Garden. 