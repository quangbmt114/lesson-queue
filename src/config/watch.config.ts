export interface WatchConfig {
  enabled: boolean;
  watchAssets: boolean;
  deleteOutDir: boolean;
  includePatterns: string[];
  excludePatterns: string[];
  debounceTime: number;
}

export const watchConfig = (): WatchConfig => ({
  enabled: process.env.WATCH_MODE === 'true',
  watchAssets: process.env.WATCH_ASSETS === 'true',
  deleteOutDir: process.env.DELETE_OUT_DIR === 'true',
  includePatterns: ['src/**/*.ts', 'src/**/*.graphql', 'src/**/*.json'],
  excludePatterns: [
    'src/**/*.spec.ts',
    'src/**/*.test.ts',
    'src/**/*.d.ts',
    'dist/**/*',
    'node_modules/**/*',
  ],
  debounceTime: parseInt(process.env.WATCH_DEBOUNCE_TIME || '300', 10),
});
