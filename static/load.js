const uploadImage = async () => {
    const input = document.getElementById('imageInput');
    const file = input.files[0];
    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch('../upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to upload image');
        }

        const jsonResponse = await response.json();
        console.log(jsonResponse);

        const classes = jsonResponse.predictions;
        // classes[12] = { "class": "fishy fish", "confidence": 0.1 }

        const editableClassesDiv = document.getElementById('editable-classes');
        const suggestedClassesDiv =
            document.getElementById('suggested-classes');
        const addClassBtn = document.getElementById('add-class-btn');

        // Create input fields for classes with confidence >= 0.5

        classes
            .filter((cls) => cls.confidence >= 0.5)
            .forEach((cls) => {
                const inputField = document.createElement('input');
                inputField.type = 'text';
                inputField.value = cls.class;

                const closeButton = document.createElement('button');
                closeButton.style.border = 'none';
                closeButton.style.background = 'transparent';
                closeButton.style.cursor = 'pointer';
                closeButton.innerHTML = 'x';

                closeButton.addEventListener('click', () => {
                    editableClassesDiv.removeChild(inputField);
                    editableClassesDiv.removeChild(br);
                    editableClassesDiv.removeChild(closeButton);
                });

                editableClassesDiv.appendChild(closeButton);
                editableClassesDiv.appendChild(inputField);
                const br = document.createElement('br');
                editableClassesDiv.appendChild(br);
            });

        // Create buttons for classes with confidence < 0.5

        classes
            .filter((cls) => cls.confidence < 0.5)
            .forEach((cls) => {
                const button = document.createElement('button');
                button.textContent = cls.class;
                button.onclick = () => {
                    const inputField = document.createElement('input');
                    inputField.type = 'text';
                    inputField.value = cls.class;
                    editableClassesDiv.appendChild(inputField);
                    button.remove();
                };

                suggestedClassesDiv.appendChild(button);
            });

        // Add event listener to "Add Class" button

        addClassBtn.onclick = () => {
            const inputField = document.createElement('input');
            inputField.type = 'text';
            editableClassesDiv.appendChild(inputField);
        };
    } catch (exception) {
        console.log(exception);
    }
};
