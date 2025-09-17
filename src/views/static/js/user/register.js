document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("registerForm");
    
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearErrors();
        
        if (!validateForm()) {
            return;
        }

        const formData = {
            nome: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            senha: document.getElementById('password').value, // Add password field
            curso: document.getElementById('course').value.trim(),
            periodo: document.getElementById('period').value,
            status: document.getElementById('status').value
        };

        try {
            const response = await fetch('/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.register) {
                window.location.href = '/user/login';
            } else {
                Object.keys(data.errors || {}).forEach(field => {
                    displayError(field, data.errors[field]);
                });
            }
        } catch (error) {
            displayError('name', 'Erro ao processar o registro. Tente novamente.');
        }
    });
});

function clearErrors() {
    document.querySelectorAll('.error').forEach(error => {
        error.textContent = '';
    });
}

function displayError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function validateForm() {
    let isValid = true;
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const course = document.getElementById('course').value.trim();
    const period = document.getElementById('period').value;
    const status = document.getElementById('status').value;

    if (name.length < 3) {
        displayError('name', 'Nome deve ter pelo menos 3 caracteres');
        isValid = false;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        displayError('email', 'Email inválido');
        isValid = false;
    }

    if (course.length < 3) {
        displayError('course', 'Digite o nome do curso');
        isValid = false;
    }

    if (!period) {
        displayError('period', 'Selecione um período');
        isValid = false;
    }

    if (!status) {
        displayError('status', 'Selecione um status');
        isValid = false;
    }

    const password = document.getElementById('password').value;
    if (!password || password.length < 6) {
        displayError('password', 'Senha deve ter pelo menos 6 caracteres');
        isValid = false;
    }

    return isValid;
}
