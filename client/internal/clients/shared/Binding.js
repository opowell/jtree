class Binding {

    constructor(b) {
        this.elementBindings = [];
        this.value = b.object[b.property];
        var _this = this;
        Object.defineProperty(b.object, b.property, {
            get: this.valueGetter.bind(_this),
            set: this.valueSetter.bind(_this)
        });
        b.object[b.property] = this.value;
    }

    valueGetter() {
        return this.value;
    }

    valueSetter(val) {
        this.value = val;
        for (var i = 0; i < this.elementBindings.length; i++) {
            var binding=this.elementBindings[i];
            binding.element[binding.attribute] = val;
        }
    }

    addBinding(element, attribute, event){
        var binding = {
            element: element,
            attribute: attribute
        };
        if (event){
            element.addEventListener(event, function(event){
                this.valueSetter(element[attribute]);
            });
            binding.event = event;
        }
        this.elementBindings.push(binding);
        element[attribute] = this.value;
        return this;
    }

}
