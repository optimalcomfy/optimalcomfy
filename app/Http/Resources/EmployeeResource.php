<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'=>$this->id,
            'salary'=>$this->salary,
            'loan_limit' => $this->loan_limit,
            'user_id' => $this->user_id,
            'company_id' => $this->company_id,
            'user'=>$this->user,
            'company'=>$this->company
        ];
    }
}
