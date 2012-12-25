/**
 * Хранилище темплейтов
 */
function TemplateStorage(data) {
    this.templates = data;
}
TemplateStorage.prototype.getTmpl = function (template){
    if(_.isFunction(this.templates[template]))
        return this.templates[template];
    if(_.has(this.templates, template)){
        $.ajax(this.templates[template], {
            async:false,
            method:'get',
            context:this
        }).done(function (rsp){
            this.templates[template] = _.template(rsp);
        });
        return this.templates[template];
    }
    return false;
}
TemplateStorage.prototype.render = function (template, data){
    data = data || {};
    var tpl = this.getTmpl(template);
    if(tpl)
        return tpl(data);
    
    return '';
}