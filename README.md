<div align="center">
  <h2>Lowfi</h2>
  <p>A SomaFM client for your terminal.</p>
</div>

## Installation

```bash
npm install -g lowfi
```

## Version 1.0 Update

Lowfi v1.0 is now a dedicated SomaFM client.

Previous versions used SoundCloud playlists, but SoundCloud stream behavior changed in ways that made long-term CLI playback unreliable.

To keep Lowfi stable and simple, the project moved to SomaFM-only streaming.

## Usage

```bash
lowfi --help
```

### List Stations

```bash
lowfi list
```

### Play a Station

Interactive picker:

```bash
lowfi play
```

Play by station ID:

```bash
lowfi play groovesalad
```

Play with options:

```bash
lowfi play groovesalad --quality highest --volume 0.7
```

`--quality` supports: `highest`, `high`, `slow`

`--volume` is between `0` and `1`

## Prerequisites

- [**mpv**](https://mpv.io/): playback engine

## License

MIT
