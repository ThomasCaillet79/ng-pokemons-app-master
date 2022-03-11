import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Pokemon } from './pokemon';
import { Router } from '@angular/router';
import { PokemonsService } from './pokemons.service';

@Component({
	selector: 'list-pokemon',
	templateUrl: './app/pokemons/list-pokemon.component.html'
})
export class ListPokemonComponent implements OnInit {

	pokemons: Pokemon[] = null;
	test: any = null;

	constructor(
		private router: Router,
		private pokemonsService: PokemonsService,
		private titleService: Title) { }

	ngOnInit(): void {
		this.getPokemons();
	}

	getPokemons(): void {
		this.titleService.setTitle('Liste des pokémons');
		this.pokemons = this.pokemonsService.getPokemons();
	}

	selectPokemon(pokemon: Pokemon): void {
		let link = ['/pokemon', pokemon.id];
		this.router.navigate(link);
	}

}
