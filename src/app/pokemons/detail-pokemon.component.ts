import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Pokemon } from './pokemon';
import { PokemonsService } from './pokemons.service';
import {AuthService} from "../auth.service";

@Component({
	selector: 'detail-pokemon',
	templateUrl: './app/pokemons/detail-pokemon.component.html'
})
export class DetailPokemonComponent implements OnInit {

	pokemon: Pokemon = null;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private pokemonsService: PokemonsService,
		private titleService: Title,
		private authService: AuthService) { }

	ngOnInit(): void {
		let id = +this.route.snapshot.paramMap.get('id');
		this.pokemon = this.pokemonsService.getPokemon(id)
		this.titleService.setTitle(`Informations sur ${this.pokemon.name}`);
	}

	goBack(): void {
		this.router.navigate(['/pokemon/list']);
	}

	goEdit(pokemon: Pokemon): void {
		let link = ['/pokemon/edit', pokemon.id];
		this.router.navigate(link);
	}

	delete(pokemon: Pokemon): void {
		this.pokemonsService.deletePokemon(pokemon)
			.subscribe(_ => this.goBack());
	}

}
