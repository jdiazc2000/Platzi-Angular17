import { Component, computed, signal, effect, OnInit, Injector, inject } from '@angular/core';
import { Task } from './models/tasks.model';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FilterStates } from './enums/FilterStates';
import { take } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(){}
  injector = inject(Injector);

  tasks = signal<Task[]>([]);
  name = 'Julio';
  buttonstate = false;
  colorCtrl = new FormControl();
  filter = signal('all')
  FiltersEnum = FilterStates

  newTaskCtrl = new FormControl('',{
    nonNullable: true,
    validators: [
      Validators.required
    ]
  });

  nameCtrl = new FormControl('',{
    nonNullable: false,
    validators: [
      Validators.required,
      Validators.minLength(3),
    ]
  });

  ngOnInit(): void {
    const datastorage = localStorage.getItem('tasks')
    if(datastorage){
      const tasks = JSON.parse(datastorage)
      this.tasks.set(tasks)
    }
    this.trackTasks()
    console.log(this.tasks.length)
  }


  TaskByFilter = computed(() => {
    const filter = this.filter();
    const task = this.tasks();
    let data:Task[];

    switch (filter) {
      case FilterStates.Pending:
        data = task.filter(task => !task.completed) 
        break;
      case FilterStates.Completed:
        data =  task.filter(task => task.completed)
        break;
      default:
        data =  task
        break;
    }

    return data;
  })

  trackTasks(){
    effect(() => {
      const tasks = this.tasks();
      localStorage.setItem('tasks', JSON.stringify(tasks))
    }, {injector: this.injector})
  }

  ChangeFilters(filter: string){
    this.filter.set(filter)
  }

  ClearCompleted(){
    this.tasks.update(tasks => tasks.filter((tasks) => !tasks.completed))
  }

  GetInputValue(value: Event){
    if(this.newTaskCtrl.valid){
      if(this.newTaskCtrl.value.trim() !== ''){
        this.AddTask(this.newTaskCtrl.value.trim());
        this.newTaskCtrl.setValue("");
      }
    }
  }

  AddTask(title: string){
    const newTask: Task = {id: Date.now(), title: title, completed: false }
    this.tasks.update(tasks => [...tasks,newTask])
  }

  UpdateTaskStatus(index: number){
    this.tasks.update((tasks) => {
        return tasks.map((task, position) => {
            if (position === index) {
                return {...task, completed: !task.completed};
            }
            return task;
        });
    });
  }

  UpdateTaskEditingMode(index: number){
    this.tasks.update((tasks) => {
        return tasks.map((task, position) => {
            if (position === index) {
                return {...task, editing: true};
            }
            return {...task, editing: false};
        });
    });
  }

  UpdateTaskText(index: number, event: Event){
    const input = event.target as HTMLInputElement
    this.tasks.update((tasks) => {
        return tasks.map((task, position) => {
            if (position === index) {
                return {...task, title: input.value, editing: false};
            }
            return task;
        });
    });
  }


  DeleteTask(index: number){
    this.tasks.update(tasks => tasks.filter((tasks, position) => position !== index))
  }

}
