import { defineConfig } from 'vite';
import inspect from 'vite-plugin-inspect';
import react from '@vitejs/plugin-react-swc';
import yagOpenApi, { remote, file } from '@yag-openapi/vite-plugin';

export default defineConfig({
  plugins: [react(), inspect(), yagOpenApi({
    'RemotePetsStore': remote('https://petstore.swagger.io/v2/swagger.json', {
      pollingInterval: 60_000,
    }),
    'LocalPetsStore': file('./data/openapi.json', {
      watch: true,
    }),
  })],
})
