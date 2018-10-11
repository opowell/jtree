export default {
    name: 'AppRow',
    props: {
        app: Object,
        options: Object,
        cols: {
            type: Array,
            default: ['id', 'name', 'description']
        }
    },
    template: `
        <tr>
        <td v-for='col in cols' :key='col'>
            {{ col }}: {{ app[col] }}
        </td>
        </tr>
        `
};