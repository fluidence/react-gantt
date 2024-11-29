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
				// entryFileNames: 'demo2-[hash].js',
				// assetFileNames: 'demo2-[hash].[ext]',
				entryFileNames: 'gantt-demo.js',
				assetFileNames: 'gantt-demo.[ext]'
			},
		},
	},
})
