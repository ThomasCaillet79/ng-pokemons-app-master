import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Pokemon } from './pokemon';
import {PokemonsService} from "./pokemons.service";

@Component({
	selector: 'add-pokemon',
	templateUrl: './app/pokemons/add-pokemon.component.html'
})
export class AddPokemonComponent implements OnInit {

	pokemon: Pokemon = null;
	pokemons: Pokemon[] = null;

	constructor(private titleService: Title, private pokemonsService: PokemonsService) { }

	ngOnInit(): void {
		this.titleService.setTitle('Ajouter un pokémon');
		this.pokemon = new Pokemon();
		this.pokemon.id = this.pokemonsService.idMax;
	}

}
