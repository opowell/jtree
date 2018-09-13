Vue.component('client-row', {
  props: ['client'],
  template: `
  <tr>
      <td>{{client.pId}}</td>
      <td>ready</td>
      <td>-</td>
      <td><a :href='"http://" + link' target='_blank'>{{link}}</a></td>
  </tr>
  `,
  computed: {
    link() {
      return partLink(this.client.pId);
    }
  }
});