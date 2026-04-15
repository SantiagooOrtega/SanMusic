import app from './app';

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🎵 Music-San API running on http://localhost:${PORT}`);
});
