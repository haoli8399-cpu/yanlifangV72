import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { resolve, dirname, join } from 'path';

function copyDir(src: string, dest: string) {
  if (!existsSync(src)) return;
  if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const s = join(src, entry), d = join(dest, entry);
    statSync(s).isDirectory() ? copyDir(s, d) : copyFileSync(s, d);
  }
}

export default defineConfig({
  plugins: [
    uni(),
    {
      name: 'copy-wxcomponents',
      closeBundle() {
        const src = resolve(__dirname, 'wxcomponents');
        const dest = resolve(__dirname, 'dist', 'build', 'mp-weixin', 'wxcomponents');
        if (existsSync(src)) {
          console.log('[copy-wxcomponents] 复制 wxcomponents 到产物目录...');
          copyDir(src, dest);
        }
      }
    }
  ],
  resolve: {
    alias: { '@': '/src' }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/styles/variables.scss";\n'
      }
    }
  }
});
