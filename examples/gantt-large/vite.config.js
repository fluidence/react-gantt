import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
	base: "./",
	plugins: [react()],
	build: {
		manifest: true,
		assetsDir: '.',
		outDir: `dist`,
		emptyOutDir: true,
		sourcemap: false,
		rollupOptions: {
			output: {
				entryFileNames: 'demo3-[hash].js',
				assetFileNames: 'demo3-[hash].[ext]',
			},
		},
	},
})
