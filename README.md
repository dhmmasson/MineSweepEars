# ld32
My entry in ludum dare 32

#Folder architecture.
Public contains every ressources needed by the webpages such as img, css, js. Currently contains basic cover css from bootstrap, the philoGL lib, a bufferLoader lib for importing sounds and a spatialHash lib that I often use.

views contains the ejs necessary to produce the webpage.

res are some code base I use to remember how to set up philoGL and WebAudio, some examples shaders and the frequency of all the musical notes (e.g A = 440Hz)

# Install 

```bash
mkdir -p docs/game/
npx ejs views/pages/landing.ejs -o docs/index.html
npx ejs views/pages/game.ejs -o docs/game/index.html
```