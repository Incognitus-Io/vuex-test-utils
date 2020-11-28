import { terser } from 'rollup-plugin-terser';

export default {
  umd: {
    output: 'dist/umd/index.js',
    format: 'umd',
    module: 'esnext',
    target: 'es2020',
    env: 'development'
  },
  umdMin: {
    output: 'dist/umd/index.min.js',
    format: 'umd',
    module: 'esnext',
    target: 'es2020',
    plugins: {
      post: [terser()]
    },
    env: 'production'
  },
  esm: {
    output: 'dist/esm/index.js',
    format: 'esm',
    module: 'esnext',
    target: 'es2020',
    genDts: true
  },
  cjs: {
    output: 'dist/cjs/index.js',
    format: 'cjs',
    module: 'esnext',
    target: 'es2020'
  },
};
