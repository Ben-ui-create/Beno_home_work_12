{
  document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');

    const btn = document.getElementById('taskBtn');
    const taskInfo = document.querySelector('.taskInfo');

    btn.textContent = 'Refresh';

    const formContainer = document.createElement('div');
    formContainer.style.cssText = 'margin-bottom: 25px; padding: 15px; border: 1px solid #ddd; max-width: 400px; border-radius: 8px; font-family: sans-serif;';
    formContainer.innerHTML = `
      <h3 style="margin-top:0;">Create New Task</h3>
      <input type="text" id="createTitle" placeholder="Title" style="width:100%; padding:8px; margin-bottom:10px; box-sizing:border-box;" required><br>
      <input type="text" id="createDesc" placeholder="Description" style="width:100%; padding:8px; margin-bottom:10px; box-sizing:border-box;"><br>
      <input type="date" id="createDate" style="width:100%; padding:8px; margin-bottom:15px; box-sizing:border-box;" required><br>
      <button id="createBtn" style="background:#28a745; color:white; border:none; padding:10px 15px; cursor:pointer; border-radius:4px; width:100%;">Create</button>
    `;

    document.body.append(formContainer);

    const createBtn = document.getElementById('createBtn');
    const createTitle = document.getElementById('createTitle');
    const createDesc = document.getElementById('createDesc');
    const createDate = document.getElementById('createDate');

    const getHeaders = () => ({
      'Authorization': `Bearer ${token || ''}`,
      'Content-Type': 'application/json'
    });

    const loadTasks = async () => {
      try {
        const response = await fetch('/tasks?page=1&limit=10', {
          method: 'GET',
          headers: getHeaders(),
        });

        if (!response.ok) {
          throw new Error(`Server Error`);
        }

        const result = await response.json();
        taskInfo.innerHTML = '';

        let tasks = result && Array.isArray(result.result) ? result.result : [];

        if (tasks.length === 0) {
          taskInfo.textContent = 'Task chka';
          return;
        }

        tasks.forEach(task => {
          const taskCard = document.createElement('div');
          taskCard.style.cssText = 'border: 1px solid #ccc; padding: 15px; margin-bottom: 12px; border-radius: 6px; position: relative; background:#f9f9f9; font-family: sans-serif;';

          const title = document.createElement('h3');
          title.textContent = task.title || 'not title';
          title.style.margin = '0 0 8px 0';
          taskCard.appendChild(title);

          if (task.description) {
            const desc = document.createElement('p');
            desc.textContent = task.description;
            desc.style.margin = '0 0 8px 0';
            taskCard.appendChild(desc);
          }

          const actionsContainer = document.createElement('div');
          actionsContainer.style.cssText = 'margin-top: 10px; display: flex; gap: 10px;';

          const updateBtn = document.createElement('button');
          updateBtn.textContent = 'Update';
          updateBtn.style.cssText = 'background: #007bff; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px;';
          updateBtn.addEventListener('click', () => updateTask(task.id, task.title, task.description));
          actionsContainer.appendChild(updateBtn);

          const deleteBtn = document.createElement('button');
          deleteBtn.textContent = 'Delete';
          deleteBtn.style.cssText = 'background: #dc3545; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px;';
          deleteBtn.addEventListener('click', () => deleteTask(task.id));
          actionsContainer.appendChild(deleteBtn);

          taskCard.appendChild(actionsContainer);
          taskInfo.appendChild(taskCard);
        });

      } catch (error) {
        console.error(error);
      }
    };

    createBtn.addEventListener('click', async () => {
      const title = createTitle.value.trim();
      const description = createDesc.value.trim();
      const task_date = createDate.value;

      if (!title || !task_date) {
        alert('Not title or description or task_date');
        return;
      }

      try {
        const response = await fetch('/tasks', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({title, description, task_date})
        });

        if (!response.ok) {
          throw new Error ('Server Error');
        }

        createTitle.value = '';
        createDesc.value = '';
        createDate.value = '';

        await loadTasks();

      } catch (error) {
        console.error(error);
      }
    });

    const updateTask = async (id, currentTitle, currentDesc) => {
      const newTitle = prompt('Updated title is tasks', currentTitle);
      if (newTitle === null) return;

      const newDesc = prompt('Updated description is tasks', currentDesc || '');
      if (newDesc === null) return;

      try {
        const response = await fetch(`/tasks/${id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({
            title: newTitle.trim(),
            description: newDesc.trim()
          }),
        });

        if (!response.ok) {
          throw new Error('Server Error');
        }

        await loadTasks();
      } catch (error) {
        console.error(error);
      }
    };

    const deleteTask = async (id) => {
      try {
        const response = await fetch(`/tasks/${id}`, {
          method: 'DELETE',
          headers: getHeaders(),
        });

        if (!response.ok) {
          throw new Error ('Server Error');
        }

        await loadTasks();
      } catch (error) {
        console.error(error);
      }
    };

    btn.addEventListener('click', loadTasks);

    loadTasks();
  });
}
