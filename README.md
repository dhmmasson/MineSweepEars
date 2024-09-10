# MineSweepear Island
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.13743147.svg)](https://doi.org/10.5281/zenodo.13743147)

_MineSweepear Island_ is a Minesweeper-inspired puzzle game developed for **Ludum Dare 32**, where the theme was "An Unconventional Weapon." Set on a hexagonal grid, players must create sweep paths to score points while avoiding hidden mines. Each tile displays the number of adjacent mines and its point value, adding a strategic layer to path creation. The unique twist comes from the game's use of spatialized audio cues—players use their ears to detect nearby mines, introducing an innovative audio-based gameplay mechanic. 


## Folder architecture.
Public contains every ressources needed by the webpages such as img, css, js. Currently contains basic cover css from bootstrap, the philoGL lib, a bufferLoader lib for importing sounds and a spatialHash lib that I often use.

views contains the ejs necessary to produce the webpage.

res are some code base I use to remember how to set up philoGL and WebAudio, some examples shaders and the frequency of all the musical notes (e.g A = 440Hz)

## Install 

```bash
mkdir -p docs/game/
npx ejs views/pages/landing.ejs -o docs/index.html
npx ejs views/pages/game.ejs -o docs/game/index.html
```

## Cite this repository
```APA
Masson, D. (2015). MineSweepEar Island (Version v1.1.0) [Computer software]. https://doi.org/10.5281/zenodo.13743147
```

```bibtex
@software{Masson2015_MineSweepEar,
    author = {Masson, Dimitri},
    license = {MIT},
    month = apr,
    title = {{MineSweepEar Island}},
    url = {https://github.com/dhmmasson/MineSweepEars/tree/v1.0.0},
    version = {v1.0.0},
    year = {2015}
}
```