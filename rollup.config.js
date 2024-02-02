import terser from '@rollup/plugin-terser'

export default {
  input: 'src/index.js',
  output: [
    {
      name: 'Pico8Reader',
      file: 'dist/umd/bundle.js',
      format: 'umd'
    },
    {
      file: 'dist/esm/bundle.js',
      format: 'esm'
    },
    {
      file: 'dist/iife/bundle.js',
      format: 'iife'
    }
  ],
  plugins: [
    terser()
  ]
}
