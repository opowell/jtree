<template>
  <tr>
      <td v-for='(field, index) in fields' :key='index'>
          <div style='white-space: normal;' v-html="getProp(session, field)"/>
      </td>
  </tr>
</template>

<script>
export default {
  name: 'SessionRow',
  props: {
    fields: Array,
    session: Object,
  },
  methods: {
    getProp(obj, field) {
      try {
        return eval('obj.' + field);
      } catch {
        return '-';
      }
    },
  }
}
</script>
