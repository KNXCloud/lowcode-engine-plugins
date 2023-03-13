const MagicString = require('magic-string').default;

const code = `import { defineComponent, ref, reactive } from 'vue';

export default defineComponent({
  methods: {
    testFn() {
      const a = ref(5);
      const b = reactive(6);
      console.log(b);
    }
  }
})`;

let s = new MagicString(code);

s.overwrite(132, 135, 'window.ref').overwrite(156, 164, 'window.reactive');
console.log(s.toString());
