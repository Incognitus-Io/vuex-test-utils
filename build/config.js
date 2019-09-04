import { uglify } from 'rollup-plugin-uglify'

export default {
  umd: {
    output: 'dist/umd/index.js',
    format: 'umd',
    module: 'esnext',
    target: 'esnext',
    env: 'development'
  },
  umdMin: {
    output: 'dist/umd/index.min.js',
    format: 'umd',
    module: 'esnext',
    target: 'es5',
    plugins: {
      post: [uglify()]
    },
    env: 'production'
  },
  esm: {
    output: 'dist/esm/index.js',
    format: 'esm',
    module: 'esnext',
    target: 'esnext',
    genDts: true
  },
  cjs: {
    output: 'dist/cjs/index.js',
    format: 'cjs',
    module: 'esnext',
    target: 'esnext'
  },
};
