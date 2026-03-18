document.addEventListener('DOMContentLoaded', () => {
    const rangeInput = document.getElementById('nota');
    const scoreValue = document.getElementById('scoreValue');
    const form = document.getElementById('feedbackForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');
    const alertBox = document.getElementById('alertBox');
    const alertMessage = document.getElementById('alertMessage');

    // Update score display dynamically
    rangeInput.addEventListener('input', (e) => {
        scoreValue.textContent = parseFloat(e.target.value).toFixed(1);
    });

    const setAlert = (message, type) => {
        alertBox.className = `alert ${type}`;
        alertMessage.textContent = message;
    };

    const clearAlert = () => {
        alertBox.className = 'alert hidden';
        alertMessage.textContent = '';
    };

    const toggleLoading = (isLoading) => {
        submitBtn.disabled = isLoading;
        if (isLoading) {
            btnText.classList.add('hidden');
            spinner.classList.remove('hidden');
        } else {
            btnText.classList.remove('hidden');
            spinner.classList.add('hidden');
        }
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        clearAlert();
        toggleLoading(true);

        const descricao = document.getElementById('descricao').value.trim();
        const nota = parseFloat(rangeInput.value);

        const payload = {
            descricao: descricao,
            nota: nota
        };

        try {
            const response = await fetch('/feedbacks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                // Success
                setAlert('Feedback enviado com sucesso! Muito obrigado.', 'success');
                form.reset();
                rangeInput.value = 5.0;
                scoreValue.textContent = '5.0';
            } else {
                // Handle different error status
                let errorData = 'Erro desconhecido';
                try {
                    errorData = await response.text();
                } catch(e) {}
                setAlert(`Erro ao enviar: ${errorData || 'Tente novamente mais tarde.'}`, 'error');
            }
        } catch (error) {
            console.error('Submission error:', error);
            setAlert('Erro de conexão ao servidor. Verifique sua rede e tente novamente.', 'error');
        } finally {
            toggleLoading(false);
        }
    });
});
