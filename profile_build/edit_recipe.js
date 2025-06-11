window.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('editForm');
  const previewImage = document.getElementById('previewImage');

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  if (!id) return alert('No recipe ID provided.');

  // Fetch the recipe
  try {
    const res = await fetch(`http://localhost:5000/recipes`);
    const recipes = await res.json();
    const recipe = recipes.find(r => r.id == id);
    if (!recipe) return alert('Recipe not found');

    form.title.value = recipe.title;
    form.ingredients.value = recipe.ingredients;
    form.instructions.value = recipe.instructions;
    form.id.value = recipe.id;
    form.existingImage.value = recipe.image;
    previewImage.src = recipe.image || '';
  } catch (err) {
    console.error(err);
    alert('Failed to load recipe.');
  }

  form.image.onchange = async () => {
    const file = form.image.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch('http://localhost:5000/upload', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    previewImage.src = data.url;
    form.existingImage.value = data.url;
  };

  form.onsubmit = async (e) => {
    e.preventDefault();

    const updatedRecipe = {
      id: Number(form.id.value),
      title: form.title.value.trim(),
      ingredients: form.ingredients.value,
      instructions: form.instructions.value,
      image: form.existingImage.value
    };

    await fetch('http://localhost:5000/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedRecipe)
    });

    alert('Recipe updated.');
    window.opener.fetchRecipes?.();
    window.opener.location.reload();
    window.close();
  };
});

// Make deleteRecipe globally available
window.deleteRecipe = async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  const confirmed = confirm('Are you sure you want to delete this recipe?');
  if (!confirmed || !id) return;

  try {
    const res = await fetch(`http://localhost:5000/recipes/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      alert('Recipe deleted.');
      window.close();
      if (window.opener) window.opener.location.reload();
    } else {
      const error = await res.json();
      alert('Delete failed: ' + error.error);
    }
  } catch (err) {
    console.error('Delete error:', err);
    alert('Error occurred during deletion.');
  }
};