import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
    selector: 'create-account',
    templateUrl: './app/create-account.component.html',
    styleUrls: ['./app/create-account.component.css']
})
export class CreateAccountComponent implements OnInit {

    constructor(
        private router: Router) { }

    ngOnInit() {
        // Initialisation de la propriété types

    }

    // La méthode appelée lorsque le formulaire est soumis.
    onSubmit(): void {

    }

    goBack(): void {
        let link = ['/'];
        this.router.navigate(link);
    }

}
