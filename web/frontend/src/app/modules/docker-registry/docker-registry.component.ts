import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { MAT_SNACKBAR_CONFIGURATION_60000_DUR } from '../../constants/cvah.constants';
import { MatSnackBarService } from '../../services/mat-snackbar.service';
import { DockerRegistryClass } from './classes/docker-registry.class';
import { DOCKER_REGISTRY_TITLE } from './constants/docker-registry.constant';
import { DockerRegistryService } from './services/docker-registry.service';

/**
 * Component used for displaying docker registry data
 *
 * @export
 * @class DockerRegistryComponent
 * @implements {OnInit}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-docker-registry',
  templateUrl: './docker-registry.component.html',
  styleUrls: ['./docker-registry.component.scss']
})
export class DockerRegistryComponent implements OnInit {
  // Used for showing docker registry data within html table
  readonly columnsForImages = ['name', 'tags', 'image_id', 'image_size'];
  // Docker registry for html table
  registry: DockerRegistryClass[];
  // Used for displaying progress bar
  loading: boolean;

  /**
   * Creates an instance of DockerRegistryComponent.
   *
   * @param {Title} title_
   * @param {DockerRegistryService} docker_registry_service_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @memberof DockerRegistryComponent
   */
  constructor(private title_: Title,
              private docker_registry_service_: DockerRegistryService,
              private mat_snackbar_service_: MatSnackBarService) {
    this.registry = [];
    this.loading = false;
  }

  /**
   * Used for setting up subscriptions
   *
   * @memberof DockerRegistryComponent
   */
  ngOnInit() {
    this.title_.setTitle(DOCKER_REGISTRY_TITLE);
    this.api_get_docker_registry_();
  }

  /**
   * Used for making api rest call to get docker registry
   *
   * @private
   * @memberof DockerRegistryComponent
   */
  private api_get_docker_registry_(): void {
    this.loading = true;
    this.docker_registry_service_.get_docker_registry()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: DockerRegistryClass[]) => {
          this.registry = response;
          this.loading = false;
        },
        (error: HttpErrorResponse) => {
          const message: string = 'getting docker registries';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }
}
