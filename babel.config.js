module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: [
      // Temporarily disabled to isolate Hermes GC crash (SIGSEGV in GCScope::_newChunkAndPHV).
      // Re-enable once root cause is confirmed. See fix_hermes_gc_crash plan.
      // 'react-native-worklets/plugin',
    ],
  };
};