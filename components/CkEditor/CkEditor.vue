<template>
    <ckeditor
        :editor="editor"
        :value="value"
        :config="config"
        :tagName="tagName"
        :disabled="disabled"
        @input="event => $emit('input', event)"
    />
</template>
<script>

import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import CKEditor from '@ckeditor/ckeditor5-vue';

if (!process.client) {
    CKEditor = { component : {template:'<div></div>'}}
}

export default {
  components: {
    ckeditor: CKEditor.component
  },
  props: {
    value: {
      type: String,
      required: false
    },
    tagName: {
      type: String,
      required: false,
      default: 'div'
    },
    disabled: {
      type: Boolean,
      required: false,
    },
    uploadUrl: {
      type: String,
      required: false
    },
    config: {
      type: Object,
      required: false,
      default: function () {
        
      }
    }
  },
  data() {
    return {
        editor: ClassicEditor,
    }
  },
};
</script>
