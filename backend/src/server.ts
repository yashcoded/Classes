import 'dotenv/config';
import './types/expressAugmentations';
import app from './app';
import { seedDemoUsers } from './seedDemoUsers';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

void seedDemoUsers().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
