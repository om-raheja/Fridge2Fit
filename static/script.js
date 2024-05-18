const editableClassesDiv = document.getElementById("editable-classes");
const suggestedClassesDiv = document.getElementById("suggested-classes");
const addClassBtn = document.getElementById("add-class-btn");
const uploadImageBtn = document.getElementById("upload-image-btn");

const uploadImage = async () => {
	const input = document.getElementById('imageInput');
	const file = input.files[0];
	const formData = new FormData();
	formData.append('image', file);

	try {
		uploadImageBtn.disabled = true;
		const response = await fetch('../upload', {
			method: 'POST',
			body: formData,
		});

		if (!response.ok) {
			throw new Error('Failed to upload image');
		}

		const jsonResponse = await response.json();

		const classes = jsonResponse.predictions;

		// Remove all underscores

		classes.forEach(str => {
			str.class = str.class.replace(/_/g, ' ');
		});

		// Create input fields for classes with confidence >= 0.5

		classes.filter((cls) => cls.confidence >= 0.5).forEach((cls) => {
			addInputField(cls.class);

		});

		// Create buttons for classes with confidence < 0.5

		classes.filter((cls) => cls.confidence < 0.5).forEach((cls) => {
			addSuggestion(cls.class);
		});
		addSuggestion("salt and pepper");


		// Add event listener to "Add Class" button
		addClassBtn.onclick = () => {
			addInputField("");
		};

	} catch (exception) {
		uploadImageBtn.disabled = false;
		console.log(exception);
	}

};

function addInputField(content) {
	const inputField = document.createElement("input");
	inputField.type = "text";
	inputField.value = content;

	const closeButton = document.createElement("button");
	closeButton.style.border = "none";
	closeButton.style.background = "transparent";
	closeButton.style.cursor = "pointer";
	closeButton.innerHTML = "x";

	closeButton.addEventListener("click", () => {
		editableClassesDiv.removeChild(inputField);
		editableClassesDiv.removeChild(br);
		editableClassesDiv.removeChild(closeButton);
	});

	editableClassesDiv.appendChild(inputField);
	editableClassesDiv.appendChild(closeButton);
	const br = document.createElement("br");
	editableClassesDiv.appendChild(br);
}

function addSuggestion(content) {
	const button = document.createElement("button");
	button.textContent = content;
	button.onclick = () => {
		addInputField(content);
		button.remove();
	};
	suggestedClassesDiv.appendChild(button);
}

async function createInference(query) {
	try {
		const response = await fetch("/completions", {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				query
			})
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		const content = data.choices[0].message.content;
		return content;
	} catch (error) {
		return `<p>Error: ${error.message}</p>`;
	}
}

async function generateIngredients() {
	// Get all input elements inside the div
	const inputs = editableClassesDiv.querySelectorAll("input");

	// Initialize an empty string to hold the input values
	let values = "";

	// Check if there are any input elements
	if (inputs.length === 0) {
		return; // Exit the function silently if there are no input elements
	}

	// Loop through the input elements and add their values to the string
	inputs.forEach((input) => {
		if (values !== "") {
			values += ", ";
		}
		values += input.value;
	});

	// Alert the input values
	const output = await createInference("Make 4 recipes based on the following exclusive ingredients:" + values);

	// Create a new div element to hold the output
	const outputDiv = document.createElement("div");
	outputDiv.innerHTML = format(output);
	console.log(output);

	// Add the output div to the page
	document.body.appendChild(outputDiv);
}

function format(markdown) {
	// Replace newlines with br tags
	var formatted = markdown.replace(/\n/g, '<br>');

	// Replace bold with b tags
	const boldRegex = /\*\*(.+?)\*\*/g;
	const boldMatches = formatted.match(boldRegex);

	if (boldMatches) {
		boldMatches.forEach(match => {
			const boldText = match.replace(boldRegex, '<b>$1</b>');
			formatted = formatted.replace(match, boldText);
		});
	}

	// Replace italics with i tags
	const italicRegex = /\*(.+?)\*/g;
	const italicMatches = formatted.match(italicRegex);

	if (italicMatches) {
		italicMatches.forEach(match => {
			const italicText = match.replace(italicRegex, '<i>$1</i>');
			formatted = formatted.replace(match, italicText);
		});
	}

	// Replace underline with u tags
	const underlineRegex = /__(.+?)__/g;
	const underlineMatches = formatted.match(underlineRegex);

	if (underlineMatches) {
		underlineMatches.forEach(match => {
			const underlineText = match.replace(underlineRegex, '<u>$1</u>');
			formatted = formatted.replace(match, underlineText);
		});
	}

	return formatted;
}
