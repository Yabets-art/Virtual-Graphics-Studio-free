class TemplateTextUpdater {
    updateTemplateText(fabricData, companyName, slogan) {
        let updatedData = JSON.parse(JSON.stringify(fabricData));
        
        if (!updatedData.objects) {
            console.error('Invalid fabric data: no objects array found');
            return null;
        }

        updatedData.objects.forEach(obj => {
            if (obj.type === 'i-text' || obj.type === 'text') {
                if (obj.text === 'Company Name') {
                    obj.text = companyName;
                } else if (obj.text === 'Slogan') {
                    obj.text = slogan;
                }
                else{
                    obj.text = "Double click to edit";
                }
            }
        });

        return updatedData;
    }

    updateTemplate(templateObject, companyName, slogan) {
    
        if (!templateObject) {
            console.error('Template not found');
            return null;
        }

        if (!templateObject.objects) {
            console.error('Template is not a valid fabric.js template');
            return null;
        }

        //return this.updateTemplateText(templateObject, companyName, slogan);
        console.log(this.updateTemplateText(templateObject, companyName, slogan));
    }
}

// Usage example:
const updater = new TemplateTextUpdater();
const updatedTemplate = updater.updateTemplate(
    {
        version: "5.3.0",
        objects: [
            {
                type: "i-text",
                text: "Company Name",      
            },
            {
                type: "i-text",
                text: "Slogan",
            }
        ]
    },
    "My Company",
    "MC"
);
