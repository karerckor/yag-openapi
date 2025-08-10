import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import yagOpenapi, { file } from '@yag-openapi/vite-plugin';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), yagOpenapi({
    'TaskManagerApi': file('../api/swagger-spec.json', {
      watch: true
    }),
    'PetsStoreApi': file('./data/petstore.openapi.json'),
  })],
})
