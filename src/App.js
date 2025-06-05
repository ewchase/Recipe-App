import React, { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Grid,
  Link,
} from '@mui/material';
import Carousel from './Carousel';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [form, setForm] = useState({
    id: null,
    title: '',
    ingredients: '',
    instructions: '',
    image: '',
  });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/recipes')
      .then(res => res.json())
      .then(setRecipes);
  }, []);

  const handleChange = async (e) => {
    const { name, value, files } = e.target;

    if (name === 'image' && files.length > 0) {
      const formData = new FormData();
      formData.append('image', files[0]);

      const res = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setForm(prev => ({ ...prev, image: data.url }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return;

    const updatedForm = {
      ...form,
      id: form.id && !isNaN(form.id) ? Number(form.id) : undefined,
    };

    const res = await fetch('http://localhost:5000/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedForm),
    });

    const savedRecipe = await res.json();

    setRecipes(prev =>
      editMode
        ? prev.map(r => (r.id === savedRecipe.id ? savedRecipe : r))
        : [...prev, savedRecipe]
    );

    setForm({ id: null, title: '', ingredients: '', instructions: '', image: '' });
    setEditMode(false);
  };

  const handleOpenNewTab = (recipe) => {
    const recipeJson = JSON.stringify(recipe);
    const newWindow = window.open('', '_blank');

    newWindow.document.write(`
      <html>
        <head>
          <title>Edit Recipe</title>
          <style>
            body { font-family: Helvetica, san-serif; padding: 20px; max-width: 600px; margin: auto; }
            input, textarea { font-family: Helvetica; font-weight:400; width: 100%; margin-bottom: 10px; padding: 8px; }
            button { margin-right: 10px; padding: 6px 12px; }
            img { max-width: 250px; max-height: 166px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <h1>Edit Recipe</h1>
          <form id="editForm">
            <input type="text" name="title" placeholder="Title" required />
            <textarea name="ingredients" placeholder="Ingredients" rows="4" required></textarea>
            <textarea name="instructions" placeholder="Instructions" rows="5" required></textarea>
            <img id="previewImage" src="${recipe.image}" alt="Recipe Image" />
            <input type="file" name="image" accept="image/*" />
            <input type="hidden" name="id" />
            <input type="hidden" name="existingImage" />
            <button type="submit">Save</button>
            <button type="button" onclick="deleteRecipe()">Delete</button>
          </form>
          <script>
            const form = document.getElementById('editForm');
            const recipe = ${recipeJson};
            const previewImage = document.getElementById('previewImage');

            form.title.value = recipe.title;
            form.ingredients.value = recipe.ingredients;
            form.instructions.value = recipe.instructions;
            form.id.value = recipe.id;
            form.existingImage.value = recipe.image;

            form.image.onchange = async () => {
              const file = form.image.files[0];
              if (!file) return;

              const formData = new FormData();
              formData.append('image', file);

              const res = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData,
              });

              const data = await res.json();
              previewImage.src = data.url;
              form.existingImage.value = data.url;
            };

            form.onsubmit = async (e) => {
              e.preventDefault();
              const id = Number(form.id.value);
              if (isNaN(id)) {
                alert("Invalid ID. Cannot update.");
                return;
              }

              const updatedRecipe = {
                id,
                title: form.title.value,
                ingredients: form.ingredients.value,
                instructions: form.instructions.value,
                image: form.existingImage.value
              };

              await fetch('http://localhost:5000/recipes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedRecipe),
              });

              alert('Recipe updated successfully.');
              window.opener.location.reload();
              window.close();
            };

            async function deleteRecipe() {
              if (confirm('Delete this recipe?')) {
                await fetch('http://localhost:5000/recipes/' + recipe.id, { method: 'DELETE' });
                alert('Recipe deleted.');
                window.close();
              }
            }
          </script>
        </body>
      </html>
    `);
  };

  return (
    <Container sx={{ py: 4 }}>
      <style>
        {`
          @media (max-width: 600px) {
            ul.recipe-grid {
            grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>

      <Carousel />

      <Typography variant="h4" gutterBottom>
        Recipe Manager
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            margin="dense"
          />
          <TextField
            fullWidth
            label="Ingredients"
            name="ingredients"
            value={form.ingredients}
            onChange={handleChange}
            margin="dense"
            multiline
            rows={2}
          />
          <TextField
            fullWidth
            label="Instructions"
            name="instructions"
            value={form.instructions}
            onChange={handleChange}
            margin="dense"
            multiline
            rows={3}
          />
          <Button variant="contained" color= "warning" component="primary" sx={{ mt: 1 }}>
            Upload Image
            <input
              type="file"
              name="image"
              hidden
              accept="image/*"
              onChange={handleChange}
            />
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSubmit}
            sx={{ mt: 1, ml: 2 }}
          >
            {editMode ? 'Update' : 'Add'} Recipe
          </Button>
        </Grid>
      </Grid>

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        Cook Book
      </Typography>
      <ul
        className="recipe-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '5px',
          listStyle: 'none',
          padding: 0,
          marginTop: '16px',
          textAlign: 'center',
          
        }}
      >
        {recipes.map(recipe => (
          <li
            key={recipe.id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '3px',
            }}
          >
            <Typography variant="body1" >
              <Link component="button" onClick={() => handleOpenNewTab(recipe)}>
                {recipe.title}
              </Link>
            </Typography>
          </li>
        ))}
      </ul>
    </Container>
  );
}

export default App;
