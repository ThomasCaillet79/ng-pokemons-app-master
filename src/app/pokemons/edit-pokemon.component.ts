import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { Pokemon } from './pokemon';
import { PokemonsService } from './pokemons.service';

@Component({
	selector: 'edit-pokemon',
	template: `
    <h2 class="header center">Editer {{ pokemon?.name }}</h2>
		<p class="center">
			<img *ngIf="pokemon" [src]="pokemon.picture"/>
		</p>
    <pokemon-form [pokemon]="pokemon"></pokemon-form>
  `,
})
export class EditPokemonComponent implements OnInit {

	pokemon: Pokemon = null;

	constructor(
		private route: ActivatedRoute,
		private pokemonsService: PokemonsService,
		private titleService: Title) { }

	ngOnInit(): void {
		let id = +this.route.snapshot.params['id'];
		this.pokemon = this.pokemonsService.getPokemon(id);
		this.titleService.setTitle(`Editer ${this.pokemon.name}`);
	}

}
